import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'
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
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
	if (!loggedinUser) return res.status(401).send('Cannot add car')
    const labels = req.body.labels
    const bug = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        ...(labels.length && { labels }) // if labels is empty remove it from bug
    }

    bugService.save(bug,loggedinUser)
        .then((savedBug) => {
            res.json(savedBug)
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot save bug')
        })
})

app.post('/api/bug', (req, res) => { // save

    const loggedinUser = authService.validateToken(req.cookies.loginToken)
	if (!loggedinUser) return res.status(401).send('Cannot add car')

    const bug = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        labels: req.body.labels
    }

    bugService.save(bug, loggedinUser)
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
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
	if (!loggedinUser) return res.status(401).send('Cannot remove bug')
    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => {
            res.send('Bug removed')
        })
        .catch(err => {
            res.status(400).send(err, 'Cannot remove bug')
        })
})

// User API
app.get('/api/user', (req, res) => {
	userService
		.query()
		.then(users => res.send(users))
		.catch(err => {
			loggerService.error('Cannot load users', err)
			res.status(400).send('Cannot load users')
		})
})

app.get('/api/user/:userId', (req, res) => {
	const { userId } = req.params

	userService
		.getById(userId)
		.then(user => res.send(user))
		.catch(err => {
			loggerService.error('Cannot load user', err)
			res.status(400).send('Cannot load user')
		})
})

// Auth API
app.post('/api/auth/login', (req, res) => {
	const credentials = req.body

	authService
		.checkLogin(credentials)
		.then(user => {
			const loginToken = authService.getLoginToken(user)
			res.cookie('loginToken', loginToken)
			res.send(user)
		})
		.catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
	const credentials = req.body

	userService
		.add(credentials)
		.then(user => {
			if (user) {
				const loginToken = authService.getLoginToken(user)
				res.cookie('loginToken', loginToken)
				res.send(user)
			} else {
				res.status(400).send('Cannot signup')
			}
		})
		.catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
	res.clearCookie('loginToken')
	res.send('logged-out!')
})

// Fallback route
// app.get('/**', (req, res) => {
// 	res.sendFile(path.resolve('public/index.html'))
// })

// console.log(process.env.PORT)
// const PORT = process.env.PORT || 3030
// app.listen(PORT, () => loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`))


app.listen(3030, () => console.log('Server ready at port 3030'))
