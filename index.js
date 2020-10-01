/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('reqBody', function getReqBody (req) {
    const body = req.body
    if (req.method === 'POST') {
        return JSON.stringify(body)
    }
    else return ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :reqBody'))

// let persons = [
//     {
//       name: "Arto Hellas",
//       number: "040-123456",
//       id: 1
//     },
//     {
//       name: "Ada Lovelace",
//       number: "39-44-5323523",
//       id: 2
//     },
//     {
//       name: "Dan Abramov",
//       number: "12-43-234345",
//       id: 3
//     },
//     {
//       name: "Mary Poppendieck",
//       number: "39-23-6423122",
//       id: 4
//     },
// ]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
    const date = new Date()
    //response.send(`<p>Phonebook has info for ${persons.length} people.</p> <p>${date}</p>`)
    Person.find({}).then(result => {
        response.send(`<p>Phonebook has info for ${result.length} people.</p> <p>${date}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    // res.json(persons)
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

// const generateId = () => {
//   const maxId = persons.length > 0
//     ? Math.max(...persons.map(n => n.id))
//     : 0
//   return maxId + 1
// }

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    // if (!body.name) {
    //   return response.status(400).json({
    //     error: 'name missing'
    //   })
    // }
    // if (!body.number) {
    //   return response.status(400).json({
    //     error: 'number missing'
    //   })
    // }
    // if (persons.some(person => person.name.includes(body.name))){
    //   return response.status(400).json({
    //       error: 'name must be unique'
    //     })
    // }

    //const person = {
    //name: body.name,
    //number: body.number,
    //id: generateId(),
    //}
    const person = new Person({
        name: body.name,
        number: body.number,
    })

    // persons = persons.concat(person)
    // response.json(person)
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)
    // if (person) {
    //   response.json(person)
    // } else {
    //   response.status(404).end()
    // }
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)

    // response.status(204).end()
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})