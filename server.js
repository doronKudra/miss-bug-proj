import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())


app.get('/api/bug', (req, res) => {
    
    const { txt = '', minSeverity = 0, pageIdx, sortBy = 'title', sortDir = 1} = req.query
    const filterBy = {
        txt,
        minSeverity: +minSeverity,
        pageIdx: pageIdx,
        [sortBy]: +sortDir
    }
    
    bugService.query(filterBy)
        .then(bugs => {
            res.json(bugs)
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot get bugs :(')
        })
})

app.put('/api/bug', (req, res) => { // update
    const labels = req.body.labels
    const bug = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        ...(labels.length && { labels }) // if labels is empty remove it from bug
    }

    bugService.save(bug)
        .then((savedBug) => {
            res.json(savedBug)
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot save bug')
        })
})

app.post('/api/bug', (req, res) => { // save
    const bug = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        labels: req.body.labels
    }

    bugService.save(bug)
        .then((savedBug) => {
            res.json(savedBug)
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot save bug')
        })
})


app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs || []
    const isVisited = visitedBugs.some((currBug) => { bugId === currBug })
    if (!isVisited) visitedBugs.push(bugId)
    res.cookie('visitedBugs', visitedBugs, { maxAge: 7000 }) // max 7 seconds after last request
    if (visitedBugs.length > 3) res.status(429).send(err, 'Too many requests') // error code 429: "Too many requests"

    bugService.getById(bugId)
        .then(bug => {
            res.json(bug)
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot find bug')
        })
})

app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            res.send('Bug removed')
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot remove bug')
        })
})

app.listen(3030, () => console.log('Server ready at port 3030'))
