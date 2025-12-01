import fs from 'fs'
import {utilService} from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    add,
    save,
}

const bugsFile = './data/bug.json'
const bugs = utilService.readJsonFile(bugsFile)

function query(filterBy) {
    if(!bugs) return Promise.reject('Error retrieving bugs \n try again later...')
    let filteredBugs = bugs
    const {txt, minSev} = filterBy
    if (txt) {
        const regExp = new RegExp(String(txt), 'i')
        filteredBugs = filteredBugs.filter(filteredBugs => regExp.test(filteredBugs.title))
    }
    if (minSev) {
        filteredBugs = filteredBugs.filter(filteredBugs => filteredBugs.severity >= +minSev)
    }
    return Promise.resolve(filteredBugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject(`Bug not found: (${bugId})`)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) return Promise.reject(`Bug not found (${bugId})`)
    bugs.splice(idx, 1)
    return _saveBugs()
}

function add({title,description,severity}) {
    const bugToSave = {
        _id: utilService.makeId(),
        title,
        description,
        severity,
        createdAt: Date.now()
    }
    bugs.push(bugToSave)
    return _saveBugs().then(()=>bugToSave)
}

function save(bug) {
    const bugToUpdate = bugs.find(currBug => currBug._id === bug._id )
    if (!bugToUpdate) return add(bug)
    bugToUpdate.title = bug.title
    bugToUpdate.description = bug.description
    bugToUpdate.severity = bug.severity
    return _saveBugs().then(()=>bugToUpdate)
}

function _saveBugs() {
    return new Promise((resolve, reject)=>{
        const strBugs = JSON.stringify(bugs, null, 2)
        fs.writeFile(bugsFile, strBugs, (err)=>{
            if (err) return reject(err,' bug encountered while trying to update bug file')
            resolve()    
        })
    })
}

