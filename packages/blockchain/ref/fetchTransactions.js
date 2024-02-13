require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const mongoose = require('mongoose');
const { connect, insertData } = require('../../db/connect');

async function insertDataIntoDBInBatches(data, batchSize = 10) {
    await batchProcess(data, batchSize, async (record) => {
        await insertDataIntoDB(record); // Assuming this function inserts a single record
    });
}

async function processIPFSHashes(filePath) {
    const ipfsHashes = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const hash of rl) {
        ipfsHashes.push(hash);
    }

    // Now fetch data in batches
    const jsonData = await fetchIPFSDataInBatches(ipfsHashes);
    return jsonData;
}

async function getIpfsHashes() {
    const ipfsHashes = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const hash of rl) {
        ipfsHashes.push(hash);
    }
    return ipfsHashes;
}

async function main() {
    // const client = await connect();
    // if (!client) {
    //     console.error("Failed to connect to MongoDB.");
    //     return;
    // }
    
    // Your logic here, including fetching IPFS data and preparing it for insertion

    // Sample usage of insertData
    // await insertData("collectionName", [{ sampleData: "Your data here" }]);

    // await client.close(); // Close the connection when you're done
}

// main().catch(console.error);

// main().catch(console.error);

// fetchPublishEventsInChunks(contract, fromBlock, toBlock, chunkSize).catch(console.error);

async function testIPFSDataWithSample(ipfsHashes, sampleSize = 100) {
    // Assuming `ipfsHashes` is an array of all your IPFS hash strings
    const sampleHashes = ipfsHashes.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
    const data = await Promise.all(sampleHashes.map(fetchIPFSData));

    // Here, you can add custom logic to process `data` as needed
    // For demonstration, we're just logging out the fetched data
    console.log(data);

    // Placeholder for insertion, replace with actual call to insert data
    // await insertDataIntoDB(data); 
}

// const ipfsHashes = getIpfsHashes()
// testIPFSDataWithSample(ipfsHashes, 100).catch(console.error);

async function sampleAndFetch() {
    const allHashes = fs.readFileSync('ipfs_hashes.txt', 'utf-8').split('\n').filter(Boolean);
    const sampleSize = 100;
    const sampledHashes = allHashes.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
    const fetchedData = [];

    for (let hash of sampledHashes) {
        const data = await fetchIPFSData(hash);
        if (data) fetchedData.push(data);
    }

    // Combine all fetched data into a single object for simplicity
    // This assumes all fetched JSON objects are of similar structure and can be combined this way
    const combinedData = fetchedData.reduce((acc, curr) => {
        acc.records = acc.records.concat(curr.records);
        return acc;
    }, { records: [] });

    console.log(combinedData);
    // Optionally, write combinedData to a file or process further
}

// sampleAndFetch().catch(console.error);

