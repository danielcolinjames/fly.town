require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const csv = require('csv-parser');
const { fetchEventLogsByAddress } = require('./fetchEventLogsByAddress');
const baseScanApiKey = process.env.BASESCAN_API_KEY;

const abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"attestationURI","type":"string"}],"name":"ActionSnapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_attestationURI","type":"string"}],"name":"publish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const ca = "0xe6734CA85163726ab94d6240c6BbabecC4436803"

function parseCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
    });
}

async function processCSV(filePath) {
    try {
        const data = await parseCSV(filePath);
        // console.log('CSV Data:', data);
        const publishTxnHashes = getPublishTransactionHashes(data);
        console.log(`${publishTxnHashes.length} Publish txn hashes`);
        // Process data or perform further actions
    } catch (error) {
        console.error('Error parsing CSV:', error);
    }
}

// Replace 'path/to/your/file.csv' with the actual path to your CSV file

function getPublishTransactionHashes(results) {
    const publishMethodName = 'Publish';
    // console.log(results[0])
    const hashes = results.filter(tx => tx.Method === publishMethodName).map(tx => tx.Txhash);
    console.log(hashes.length)
    console.log(hashes[0])
    return hashes
}

function getPublishTransactionsByHash(hashes) {
    console.log(JSON.stringify(hashes, null, 2))
    return hashes.map((hash, i) => {
        // use ethers to fetch the transaction details
        console.log(`hash ${i}:`, hash);
        // get the ipfs hash from the transaction
    });
}

const url = 'https://mainnet.base.org';
const provider = new ethers.providers.JsonRpcProvider(url);

// bb ed is what i have from eating upside every day lol
const bb = "0xbbed7fdf8465ac61d5662b38af06f3a25a9b3d66";
const publishMethodId = '0x243e280b';

const publishMethodName = 'Publish';

// I have no idea what format a "topic" is in
const publishTopic = '0xcb48f64979fb3b71e89dc0f98135b462fe71da71985c6975b34682c682326c33'

// fetchAndFilterTransactions(targetAddress)
//     .then(publishTransactions => {
//         console.log('Filtered Publish Transactions:', publishTransactions);
//     })
//     .catch(error => {
//         console.error('Error fetching or filtering transactions:', error);
//     });



// async function fetchPublishTransactions() {
//     const filter = contract.filters.Publish();
//     const logs = await provider.getLogs({
//         // fromBlock: startBlock,
//         // toBlock: endBlock,
//         address: bbAddress,
//         topics: filter.topics
//     });

//     for (const log of logs) {
//         const event = contract.interface.parseLog(log);
//         console.log(`Found Publish event with IPFS hash: ${event.args.ipfsHash}`);
//     }
// }

// async function fetchTransactions(startBlock, endBlock) {
//     for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
//         const block = await provider.getBlockWithTransactions(blockNumber);
//         for (const transaction of block.transactions) {
//             // Process each transaction to extract IPFS hashes
//             const ipfsHash = extractIPFSHashFromInputData(transaction.data);
//             if (ipfsHash) {
//                 console.log(`Found IPFS hash: ${ipfsHash}`);
//                 // Optionally, fetch data from IPFS using the hash
//             }
//         }
//     }
// }

function extractIPFSHashFromInputData(inputData) {
    // Implement your logic to parse the inputData and extract the IPFS hash
    // This is highly dependent on how the data is encoded in the transactions
    return "Extracted IPFS Hash";
}

// fetchPublishTransactions();


// fetchEventLogsByAddress(ca, baseScanApiKey)
//     .then(logs => {
//         console.log('Fetched event logs:', logs);
//     })
//     .catch(error => {
//         console.error('Error:', error.message);
//     });

// getPublishTransactionsByHash(results)

processCSV('./all-txns.csv');
