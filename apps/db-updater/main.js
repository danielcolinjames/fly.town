require('dotenv').config()
const ethers = require('ethers')
const Redis = require('ioredis')
const axios = require('axios')
const { delay } = require('../../packages/utils')
const { ca, contract, provider } = require('../../packages/blockchain/utils')
const { connect, disconnect, insertData } = require('../../packages/db/connect')

const redis = new Redis(process.env.REDIS_URL)

const BLOCK_HEIGHT_KEY = 'latestFetchedBlockHeight'

async function getCurrentBlockNumber() {
  try {
    const currentBlockNumber = await provider.getBlockNumber()
    console.log(`Current block number: ${currentBlockNumber}`)
    return currentBlockNumber
  } catch (error) {
    console.error('Failed to fetch current block number:', error)
    return null // Or handle the error as appropriate for your application
  }
}

async function getLatestFetchedBlockHeight() {
  const height = await redis.get(BLOCK_HEIGHT_KEY)
  return height ? parseInt(height, 10) : null
}

async function setLatestBlockHeight(height) {
  await redis.set(BLOCK_HEIGHT_KEY, height)
}

async function fetchIPFSData(hash, blockNumber, transactionHash) {
  const url = `https://ipfs.io/ipfs/${hash}`
  try {
    const response = await axios.get(url)
    if (response.status === 200 && response.data.records) {
      // Assuming 'records' is always an array; adjust based on actual data structure
      return response.data.records.map(record => ({
        ...record,
        metadata: { blockNumber, transactionHash, ipfsHash: hash },
      }))
    } else {
      console.error(
        `Failed to fetch IPFS data for hash ${hash}: HTTP status ${response.status}`
      )
      return []
    }
  } catch (error) {
    console.error(`Error fetching IPFS data for hash ${hash}:`, error)
    return [] // Return empty array to maintain consistency
  }
}

function logError(hash) {
  const errorFilePath = path.join(__dirname, 'errors.txt')
  fs.appendFileSync(errorFilePath, `${hash}\n`, 'utf8')
}

async function fetchAndProcessNewBlockchainEvents() {
  const fromBlock = await getLatestFetchedBlockHeight() // Assume this retrieves the last processed block height from your storage (e.g., Redis)
  const toBlock = await getCurrentBlockNumber() // Get the current blockchain height

  console.log(`Fetching new events from block ${fromBlock} to ${toBlock}`)

  if (fromBlock !== null && toBlock !== null) {
    const newEvents = await fetchPublishEventsInChunks(fromBlock + 1, toBlock)
    // Process the new events as needed, for example, inserting them into a database
    console.log(`Fetched and processed ${newEvents.length} new events.`)
    return newEvents
  } else {
    console.log(
      'Could not determine the range for fetching new blockchain events.'
    )
  }
}

async function fetchPublishEventsInChunks(
  fromBlock,
  toBlock,
  chunkSize = 2000,
  delayDuration = 1000
) {
  let allEvents = [] // Initialize an array to hold all fetched events

  for (
    let startBlock = fromBlock;
    startBlock <= toBlock;
    startBlock += chunkSize + 1
  ) {
    let endBlock = Math.min(startBlock + chunkSize, toBlock)
    console.log(`Fetching logs from block ${startBlock} to ${endBlock}`)

    try {
      const chunkEvents = await provider.getLogs({
        fromBlock: ethers.utils.hexValue(startBlock),
        toBlock: ethers.utils.hexValue(endBlock),
        // fromBlock: startBlock,
        // toBlock: endBlock,
        address: ca,
        topics: [ethers.utils.id('ActionSnapshot(string)')],
      })

      console.log(`Fetched ${chunkEvents.length} events`)

      // Map each event to a more friendly structure and add to the allEvents array
      const formattedChunkEvents = chunkEvents.map(event => {
        const parsedLog = contract.interface.parseLog(event)
        let ipfsURI = parsedLog.args.attestationURI
        // Erasing "ipfs://" if present
        ipfsURI = ipfsURI.startsWith('ipfs://') ? ipfsURI.substring(7) : ipfsURI

        console.log(`Processed IPFS URI: ${ipfsURI}`)

        // Return a structured object instead of a CSV line
        return {
          ipfsURI: ipfsURI,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        }
      })

      // Add this chunk's events to the overall list
      allEvents = allEvents.concat(formattedChunkEvents)

      await delay(delayDuration) // Delay to prevent rate limiting
    } catch (error) {
      console.error(
        `Error fetching logs for blocks ${startBlock} to ${endBlock}:`,
        error
      )
    }
  }

  console.log('Finished fetching publish events.')
  return allEvents // Return the array of all fetched and formatted events
}

async function fetchAndInsertIPFSData(newEvents) {
  const client = await connect()
  if (!client) {
    console.error('Failed to connect to MongoDB.')
    return
  }

  // Flatten all IPFS data arrays into a single array for insertion
  const allIPFSData = []
  for (const event of newEvents) {
    const ipfsData = await fetchIPFSData(
      event.ipfsURI.replace('ipfs://', ''),
      event.blockNumber,
      event.transactionHash
    )
    if (ipfsData && ipfsData.length > 0) {
      allIPFSData.push(...ipfsData)
    }
  }

  if (allIPFSData.length > 0) {
    console.log(`Inserting ${allIPFSData.length} records into MongoDB`)
    await insertData('checkins', allIPFSData)
  }

  await client.close()
  console.log('Finished fetching and inserting IPFS data.')
}

function formatIPFSData(ipfsData, event) {
  return {
    ...ipfsData,
    // just so we have it
    metadata: {
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      ipfsHash: event.ipfsURI,
    },
  }
}

async function main() {
  const newEvents = await fetchAndProcessNewBlockchainEvents()
  if (newEvents && newEvents.length > 0) {
    console.log(
      `${newEvents.length} new events fetched. Processing IPFS data...`
    )
    await fetchAndInsertIPFSData(newEvents)

    // Update the latest block height after successful processing
    const latestBlockHeight = newEvents[newEvents.length - 1].blockNumber
    await setLatestBlockHeight(latestBlockHeight)
    console.log(`Updated latest block height to ${latestBlockHeight}.`)
  } else {
    console.log('No new blockchain events to process.')
  }
  await redis.quit()
  await disconnect()
  process.exit()
}

main().catch(console.error)
