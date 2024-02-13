require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const axios = require('axios');
const readline = require('readline');
const mongoose = require('mongoose');
const { connect, insertData } = require('../db/connect');


const ca = "0xe6734CA85163726ab94d6240c6BbabecC4436803"

const abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"attestationURI","type":"string"}],"name":"ActionSnapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_attestationURI","type":"string"}],"name":"publish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const url = 'https://mainnet.base.org';
const provider = new ethers.providers.JsonRpcProvider(url);

const contract = new ethers.Contract(ca, abi, provider);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function batchProcess(array, batchSize, processFunction) {
    for (let i = 0; i < array.length; i += batchSize) {
        const batch = array.slice(i, i + batchSize);
        await Promise.all(batch.map(item => processFunction(item)));
    }
}

async function fetchPublishEventsInChunks(contract, fromBlock, toBlock, chunkSize = 10000, delayDuration = 1000) {
    let events = [];
    const outputPath = path.join(__dirname, 'ipfsURIs.txt');
    const writeStream = fs.createWriteStream(outputPath, { flags: 'a' });

    for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += chunkSize + 1) {
        let endBlock = Math.min(startBlock + chunkSize, toBlock);
        console.log(`Fetching logs from block ${startBlock} to ${endBlock}`);

        try {
            const chunkEvents = await contract.provider.getLogs({
                fromBlock: ethers.utils.hexValue(startBlock),
                toBlock: ethers.utils.hexValue(endBlock),
                address: contract.address,
                topics: [ethers.utils.id("ActionSnapshot(string)")], // Ensure this matches your event signature
            });

            console.log(`Fetched ${chunkEvents.length} events`)

            // Assuming event data contains the IPFS URI directly
            chunkEvents.forEach(event => {
                console.log(`BLACKBIRD PUBLISH EVENT FOUND | in block ${event.blockNumber} | txn ${event.transactionHash}`)
                const parsedLog = contract.interface.parseLog(event);
                const ipfsURI = parsedLog.args.attestationURI;
                console.log('IPFS URI:', ipfsURI)
                writeStream.write(ipfsURI + '\n');
            });

            events.push(...chunkEvents);
            await delay(delayDuration); // Wait for delayDuration milliseconds before the next chunk
        } catch (error) {
            console.error(`Error fetching logs for blocks ${startBlock} to ${endBlock}:`, error);
            // Consider breaking or retrying based on the error
        }
    }

    writeStream.end();
    console.log(`Total events fetched: ${events.length}`);
}

async function fetchIPFSData(hash) {
    const url = `https://ipfs.io/ipfs/${hash}`;
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            // Assuming you want to ignore the top-level "records" and return directly the array
            return response.data.records || null; 
        } else {
            // Handle non-200 responses, including 504
            logError(hash);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching IPFS data for hash ${hash}:`, error);
        logError(hash);
        return null;
    }
}

function logError(hash) {
    const errorFilePath = path.join(__dirname, 'errors.txt');
    fs.appendFileSync(errorFilePath, `${hash}\n`, 'utf8');
}


async function fetchIPFSDataInBatches(ipfsHashes, batchSize = 10) {
    const allData = [];

    await batchProcess(ipfsHashes, batchSize, async (hash) => {
        const data = await fetchIPFSData(hash);
        if (data) {
            allData.push(data); // Accumulate fetched data
        }
    });

    return allData;
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





// // MongoDB setup
// const Schema = mongoose.Schema;

// const RecordSchema = new Schema({
//     check_in_id: Number,
//     created_at: String,
//     restaurant_name: String
// });

// const RecordModel = mongoose.model('Record', RecordSchema);



// async function insertDataIntoDB(data) {
//     const db = await connect();
//     const collection = db.collection("checkin-data");
//     await collection.insertMany(data);
// }

async function insertDataIntoDBInBatches(data, batchSize = 10) {
    await batchProcess(data, batchSize, async (record) => {
        await insertDataIntoDB(record); // Assuming this function inserts a single record
    });
}

// const fromBlock = 2637424 // block of earliest txn on this contract
// const toBlock = 2886910 // for local testing

// 2886910 – 10:51PM 2/11/2024

const fromBlock = 5_000_000
const toBlock = 10_457_709

// eventual final block
// const toBlock = 10_457_709

const chunkSize = 2000; // Adjust based on what your provider allows; you might need to experiment

// fetchPublishEventsInChunks(ca, fromBlock, toBlock, chunkSize)
//     .then(events => console.log(`${events.length} events fetched`))
//     .catch(console.error);

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


async function fetchAllInBatches(filePath, batchSize = 50) {
    const client = await connect();
    if (!client) {
        console.error("Failed to connect to MongoDB.");
        return;
    }

    const allHashes = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const hash of rl) {
        allHashes.push(hash);
    }

    // Process in batches
    for (let i = 0; i < allHashes.length; i += batchSize) {
        const batch = allHashes.slice(i, i + batchSize);
        const batchDataPromises = batch.map(fetchIPFSData);
        let batchData = (await Promise.all(batchDataPromises)).filter(data => data !== null);

        // Flattening the array of records and ignoring null values
        batchData = batchData.flat();

        console.log(`Batch ${i / batchSize + 1}: Inserting ${batchData.length} records`);
        await insertData("checkin-test", batchData); // Adjust with your actual collection name

        // Adding a delay to avoid rate limiting (if necessary)
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    await client.close();
}

fetchAllInBatches('./ipfs_hashes.txt').catch(console.error);
