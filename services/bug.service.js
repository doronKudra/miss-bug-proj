import fs from 'fs'
import { utilService } from './util.service.js'

export const bugService = {
    query,
    getById,
    remove,
    add,
    save,
}

const PAGE_SIZE = 2
const bugsFile = './data/bug.json'
const bugs = utilService.readJsonFile(bugsFile)

function query(filterBy) {
    if (!bugs) return Promise.reject('Error retrieving bugs \n try again later...')
    return Promise.resolve(bugs)
        .then(bugs => {
            const { txt, minSeverity, pageIdx, title, severity, createdAt } = filterBy
            if (txt) {
                const regExp = new RegExp(String(txt), 'i')
                bugs = bugs.filter(bugs => regExp.test(bugs.title))
            }
            if (minSeverity) {
                bugs = bugs.filter(bugs => bugs.severity >= +minSeverity)
            }
            if (pageIdx) {
                const startIdx = filterBy.pageIdx * PAGE_SIZE
                bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
            }
            if (title) {
                bugs.sort((a, b) => a.title.localeCompare(b.title) * title)
            }
            if (severity || createdAt) {
                const currSort = severity ? 'severity' : 'createdAt'
                bugs.sort((a, b) => (a[currSort] - b[currSort]) * (filterBy[currSort]))
            }
            return bugs
        })

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

function add({ title, description, severity, labels }) {
    const bugToSave = {
        _id: utilService.makeId(),
        title,
        description,
        severity,
        createdAt: Date.now(),
        labels
    }
    bugs.push(bugToSave)
    return _saveBugs().then(() => bugToSave)
}

function save(bug) {
    const bugToUpdate = bugs.find(currBug => currBug._id === bug._id)
    if (!bugToUpdate) return add(bug)
    bugToUpdate.title = bug.title
    bugToUpdate.description = bug.description
    bugToUpdate.severity = bug.severity
    bugToUpdate.labels = bug.labels
    return _saveBugs().then(() => bugToUpdate)
}

function _saveBugs() {
    return new Promise((resolve, reject) => {
        const strBugs = JSON.stringify(bugs, null, 2)
        fs.writeFile(bugsFile, strBugs, (err) => {
            if (err) return reject(err, ' bug encountered while trying to update bug file')
            resolve()
        })
    })
}

