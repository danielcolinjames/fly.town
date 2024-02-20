require('dotenv').config()
const { MongoClient } = require('mongodb')
const connectionString = process.env.CONNECTION_STRING
const client = new MongoClient(connectionString)
const { DB_NAME } = require('../db/globals')

async function connect(logs = false) {
  try {
    logs && console.log('Connecting to MongoDB database...')
    await client.connect()
    logs && console.log('✅ Connected to MongoDB')
    return client
  } catch (error) {
    console.error('Connection to MongoDB failed', error)
  }
}

async function database(dbName = DB_NAME) {
  try {
    return client.db(dbName)
  } catch (error) {
    console.error('Failed to get database from client', error)
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

async function insertData(dbName, collectionName, data) {
  console.log(`Inserting ${data.length} records into ${dbName}.${collectionName}`)
  if (!data || data.length === 0) {
    console.log('No data to insert')
    return
  }
  try {
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    const result = await collection.insertMany(data)
    console.log(`${result.insertedCount} documents were inserted to ${dbName}.${collectionName}`)
  } catch (error) {
    console.error('Failed to insert data', error)
    const errorCollection = await db.collection('errors')
    await errorCollection.insertOne({ error, data })
  }
}

module.exports = { client, database, connect, disconnect, insertData }
