require('dotenv').config()
const { MongoClient } = require('mongodb')
const connectionString = process.env.CONNECTION_STRING
const client = new MongoClient(connectionString)

async function connect() {
  try {
    console.log('CONNECTING TO DB...')
    await client.connect()
    console.log('Connected to MongoDB')
    return client
  } catch (error) {
    console.error('Connection to MongoDB failed', error)
  }
}

async function disconnect() {
  try {
    await client.close()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Failed to disconnect from MongoDB', error)
  }
}

async function insertData(collectionName, data) {
  try {
    const db = client.db('flytown')
    const collection = db.collection(collectionName)
    const result = await collection.insertMany(data)
    console.log(`${result.insertedCount} documents were inserted`)
  } catch (error) {
    console.error('Failed to insert data', error)
  }
}

module.exports = { client, connect, disconnect, insertData }
