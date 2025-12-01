import express from 'express'
import { bugService } from './services/bug.service.js'

const app = express()
app.use(express.static('public'))

app.listen(3030, () => console.log('Server ready at port 3030'))

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => {
            res.json(bugs)
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot get bugs :(')
        })
})


app.get('/api/bug/save', (req, res) => {
    const bug = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.desc,
        severity: +req.query.sev,
    }

    const func = (bug._id) ? 'update' : 'add'
    bugService[func](bug)
        .then((savedBug) => {
            res.json(savedBug)
        })
        .catch(err => {
            res.status(400).send(err,'Cannot save bug')
        })
})


app.get('/api/bug/:bugId', (req, res) => { 
    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug =>{
            res.json(bug)
        })
        .catch(err => {
            res.status(400).send(err,'Cannot find bug')
        })
})


app.get('/api/bug/:bugId/remove', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            res.send('Bug removed')
        })
        .catch(err => {
            res.status(400).send(err,'Cannot remove bug')
        })
})

