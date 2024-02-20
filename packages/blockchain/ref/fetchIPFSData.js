require('dotenv').config()
const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { insertData, database } = require('../../db/connect')
const csv = require('csv-parser')

async function fetchIPFSData(hash, blockNumber, transactionHash) {
  // const url = `https://ipfs.io/ipfs/${hash}`
  const url = `https://cloudflare-ipfs.com/ipfs/${hash}`
  try {
    const response = await axios.get(url)
    if (response.status === 200) {
      // Add metadata to each record
      const records = response.data.records || []
      records.forEach(record => {
        record.metadata = { blockNumber, transactionHash, ipfsHash: hash }
      })
      return records
    } else {
      logError(hash)
      return null
    }
  } catch (error) {
    console.error(`Error fetching IPFS data for hash ${hash}:`, error)
    logError(hash)
    return null
  }
}

function logError(hash) {
  const errorFilePath = path.join(__dirname, 'errors.txt')
  fs.appendFileSync(errorFilePath, `${hash}\n`, 'utf8')
}

async function fetchIPFSDataInBatches(filePath, batchSize = 50) {
  const db = await database()
  if (!db) {
    console.error('Failed to connect to MongoDB.')
    return
  }

  const allData = []
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', data => {
      allData.push(data)
    })
    .on('end', async () => {
      for (let i = 0; i < allData.length; i += batchSize) {
        const batch = allData.slice(i, i + batchSize)
        const batchDataPromises = batch.map(row =>
          fetchIPFSData(row.ipfsHash.replace('ipfs://', ''), row.blockNumber, row.transactionHash)
        )
        const batchData = (await Promise.all(batchDataPromises)).flat().filter(data => data !== null)

        console.log(`Batch ${i / batchSize + 1}: Inserting ${batchData.length} records`)
        await insertData(db, 'checkins', batchData)

        await new Promise(resolve => setTimeout(resolve, 500)) // Delay to avoid rate limiting
      }

      console.log('Finished fetching and inserting IPFS data.')
    })
}

fetchIPFSDataInBatches('./ipfs_hashes.csv').catch(console.error)