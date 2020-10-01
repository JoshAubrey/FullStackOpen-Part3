//terminal program for testing database connection with mongoose 
const mongoose = require('mongoose')

if (process.argv.length > 3 && process.argv.length < 5 || process.argv.length > 5) {
  console.log('Format incorrect!') 
  console.log('To add new: node mongo.js <password> \"<full name>\" <number>')
  console.log('To list all: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://fullstack:${password}@fullstackopen.wbhnz.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (name === undefined) {
    Person.find({}).then(result => {
        result.forEach(person => {
          console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
        process.exit(1)
    })
}

const person = new Person({
  name: name,
  number: number,
})

person.save().then(result => {
  console.log(`added ${name} ${number} to phonebook`)
  mongoose.connection.close()
})