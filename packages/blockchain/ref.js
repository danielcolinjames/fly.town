
const { fetchEventLogsByAddress } = require('./fetchEventLogsByAddress');
const baseScanApiKey = process.env.BASESCAN_API_KEY;

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


processCSV('./all-txns.csv');