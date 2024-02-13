const fs = require('fs');
const path = require('path');
const ethers = require('ethers');
const { delay } = require('../utils');

const csvFilePath = path.join(__dirname, 'ipfs_hashes.csv');

// Initialize CSV file with headers
function initializeCSV() {
    const header = 'ipfsHash,blockNumber,transactionHash\n';
    try {
        // Check if the file exists and read the first line
        const firstLine = fs.readFileSync(csvFilePath, { encoding: 'utf8' }).split('\n')[0];
        // If the file does not contain the header, write the header
        if (firstLine !== header.trim()) {
            fs.writeFileSync(csvFilePath, header, { flags: 'w' }); // 'w' flag to create or overwrite
        }
    } catch (error) {
        // If the file does not exist, write the header
        fs.writeFileSync(csvFilePath, header, { flags: 'w' }); // 'w' flag to create or overwrite
    }
}

// contract with Publish function
const ca = "0xe6734CA85163726ab94d6240c6BbabecC4436803"

const abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"attestationURI","type":"string"}],"name":"ActionSnapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_attestationURI","type":"string"}],"name":"publish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const contract = new ethers.Contract(ca, abi, provider);

async function fetchPublishEventsInChunks(fromBlock, toBlock, chunkSize = 10000, delayDuration = 1000) {
    for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += chunkSize + 1) {
        let endBlock = Math.min(startBlock + chunkSize, toBlock);
        console.log(`Fetching logs from block ${startBlock} to ${endBlock}`);

        try {
            const chunkEvents = await provider.getLogs({
                fromBlock: ethers.utils.hexValue(startBlock),
                toBlock: ethers.utils.hexValue(endBlock),
                address: ca,
                topics: [ethers.utils.id("ActionSnapshot(string)")],
            });

            console.log(`Fetched ${chunkEvents.length} events`);

            chunkEvents.forEach(event => {
                const parsedLog = contract.interface.parseLog(event);
                let ipfsURI = parsedLog.args.attestationURI;
                // Erasing "ipfs://" if present
                ipfsURI = ipfsURI.startsWith('ipfs://') ? ipfsURI.substring(7) : ipfsURI;

                // Writing to CSV: IPFS Hash, Block Number, Transaction Hash
                const csvLine = `${ipfsURI},${event.blockNumber},${event.transactionHash}\n`;
                fs.appendFileSync(csvFilePath, csvLine, 'utf8');

                console.log(`Recorded: ${csvLine}`);
            });

            await delay(delayDuration); // Delay to prevent rate limiting
        } catch (error) {
            console.error(`Error fetching logs for blocks ${startBlock} to ${endBlock}:`, error);
        }
    }

    console.log('Finished fetching and recording publish events.');
}


// const fromBlock = 2_637_424 // block of earliest txn on this contract
// const toBlock = 10_457_709 // latest block as of 2/11/24

const fromBlock = 2_637_424
const toBlock = 10_499_109

const chunkSize = 2000;

initializeCSV();
fetchPublishEventsInChunks(fromBlock, toBlock, chunkSize, 100)
    .then(console.log('————COMPLETE————'))
    .catch(console.error);