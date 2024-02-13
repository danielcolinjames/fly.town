require('dotenv').config();
const { MongoClient } = require("mongodb");
console.log("CONNECTING TO DB...");
const connectionString = process.env.CONNECTION_STRING;
const client = new MongoClient(connectionString);

async function connect() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
        return client;
    } catch (error) {
        console.error("Connection to MongoDB failed", error);
    }
}

async function insertData(collectionName, data) {
    try {
        const db = client.db("flytown");
        const collection = db.collection(collectionName);
        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documents were inserted`);
    } catch (error) {
        console.error("Failed to insert data", error);
    }
}

module.exports = { connect, insertData };
