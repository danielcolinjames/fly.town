require('dotenv').config()
const ethers = require('ethers')
const axios = require('axios')
const { connect, insertData, database, disconnect } = require('../../packages/db/connect')
const { publishContract, nftContract, FIRST_EMIT_BLOCK, publishCa, nftCa } = require('../../packages/blockchain/utils')
const { delay, generateRestaurantId } = require('../../packages/utils')
const { DB_NAME } = require('../../packages/db/globals')
const Vibrant = require('node-vibrant')
const wcagContrast = require('wcag-contrast')

let rgbHex

async function initializeImports() {
  const rgbHexModule = await import('rgb-hex')
  rgbHex = rgbHexModule.default
}

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org')

async function main() {
  await initializeImports()

  await connect()
  console.log('Connected to MongoDB')
  console.log({ DB_NAME })

  // 1)
  // figure out what the highest token ID is so we know how many NFTs to fetch
  const highestTokenID = await findHighestTokenID()

  // 2)
  // 0 can eventually be replaced with the most recently fetched block
  const nftMetadata = await fetchNFTMetadataInBatches(0, highestTokenID)

  // 3)
  // write the metadata to the 'memberships' collection in the database
  await writeMembershipsToDatabase(nftMetadata)

  // 4)
  // find unique restaurants from the metadata, and unique tier levels for each restaurant
  const uniqueRestaurants = await findUniqueRestaurants(nftMetadata)

  // 5)
  // write the unique restaurants to the 'restaurants' collection in the database
  await writeRestaurantsToDatabase(uniqueRestaurants)

  // 6)
  // write all publish events to the database, under the 'pendingHashes' collection
  await writeIPFSHashesToPendingHashesCollection()

  // 7)
  // fetch pending hashes from the pending hashes collection
  const pendingHashes = await getPendingIPFSHashes()

  // 8)
  console.log('Fetching and processing IPFS data...')
  await fetchAndPublishIPFSDataInBatches(pendingHashes)

  await initializeTiers()

  await updateLatestMembershipDetailsToTiers()

  // 9)
  console.log('Adding data to each restaurant membership tier...')
  // add counts and accent colors to each tier level based on memberships db
  await enhanceRestaurants()

  await updateTierLevelCounts()

  // 10)
  await calculateGlobalStats()

  console.log('Finished fetching and processing all data.')
  await disconnect()
}

// 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
// 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
// 🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀🚀
main().catch(console.error)

// 1) get NFT membership highest ID
async function findHighestTokenID() {
  const currentBlockNumber = await provider.getBlockNumber()
  const chunkSize = 500
  const fromBlock = currentBlockNumber - 2_000 // look at last 2,000 blocks, should be enough to find one?
  // const fromBlock = 0
  const toBlock = currentBlockNumber

  // const singleSignature = ethers.utils.id('TransferSingle(address,address,address,uint256,uint256)')
  const batchSignature = ethers.utils.id('TransferBatch(address,address,address,uint256[],uint256[])')

  for (let startBlock = fromBlock; startBlock <= toBlock; startBlock += chunkSize + 1) {
    const endBlock = Math.min(startBlock + chunkSize, toBlock)
    console.log(`Fetching logs from block ${startBlock} to ${toBlock} for address ${nftCa}`)

    try {
      const batches = await provider.getLogs({
        fromBlock: ethers.utils.hexValue(startBlock),
        toBlock: ethers.utils.hexValue(toBlock),
        address: nftCa,
        topics: [batchSignature],
      })
      // batches can be either a huge list of `ids`, of which we want the highest number, or a single `id`

      console.log(`Fetched ${batches.length} TransferBatch events.`)

      let highestId = ethers.BigNumber.from(0) // Initialize outside the loop

      for (const event of batches) {
        const parsedLog = nftContract.interface.parseLog(event)
        let ids = parsedLog.args.ids

        // Ensure `ids` is an array, even for single transfers
        ids = Array.isArray(ids) ? ids : [ids]

        // Find the highest ID in the current event
        const currentHighestId = ids.reduce(
          (max, id) => (ethers.BigNumber.from(id).gt(max) ? ethers.BigNumber.from(id) : max),
          ethers.BigNumber.from(0)
        )

        // Update the overall highest ID if the current event's highest ID is greater
        if (currentHighestId.gt(highestId)) {
          highestId = currentHighestId
        }
      }
      console.log(`Highest ID found in the last ${toBlock - fromBlock} blocks:`, highestId.toNumber())
      return highestId
    } catch (error) {
      console.error(`Error fetching logs for blocks ${startBlock} to ${endBlock}:`, error)
    }
  }

  const highestIdNumber = highestId.toNumber()
  console.log('Found highest ID:', highestIdNumber)
  return highestIdNumber
}

// 2)
// fetch all membership NFT metadata
async function fetchNFTMetadataInBatches(fromTokenId, toTokenId, batchSize = 100) {
  const db = await database()
  const highestMembershipDoc = await db.collection('memberships').findOne(
    {},
    {
      sort: { membershipId: -1 },
      projection: { membershipId: 1 },
    }
  )
  const highestMembershipId = highestMembershipDoc ? parseInt(highestMembershipDoc.membershipId, 10) : 0

  let metadata = []

  for (let i = fromTokenId; i <= toTokenId; i += batchSize) {
    const batchIds = Array.from({ length: Math.min(batchSize, toTokenId - i + 1) }, (_, index) => i + index)
    console.log('Beginning fetching metadata for NFT ID range:', batchIds[0], 'to', batchIds[batchIds.length - 1])

    console.log('Highest membership ID in the database:', highestMembershipId)

    // Use async function inside map to ensure proper use of await
    const fetchMetadataPromises = batchIds.map(async id => {
      // Skip IDs lower than the highest membershipId in the database
      if (id > 0 && id <= highestMembershipId) {
        console.log(`Skipping ID ${id} as it's already in the database`)
        return { status: 'skipped', id }
      }

      try {
        const fetchedMetadata = await fetchNFTMetadata(id)
        return { status: 'fulfilled', value: fetchedMetadata }
      } catch (error) {
        console.error(`Error fetching NFT metadata for ID ${id}:`, error)
        return { status: 'rejected', reason: error }
      }
    })

    const batchResults = await Promise.all(fetchMetadataPromises)

    // Process each result, reformatting or logging errors as needed
    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        // Directly push reformatted metadata into the array
        const reformattedMetadata = reformatNFTMetadata(result.value)
        metadata.push(reformattedMetadata)
      } else if (result.status === 'rejected') {
        // Handle errors for each rejected promise
        await logErrorFetchingMetadata(i)
      }
    }
  }
  // Assuming highestMembershipId is the highest ID already fetched,
  // and you're interested in the range from fromTokenId to toTokenId.

  // First, ensure highestMembershipId is accounted for in the range calculation properly.
  // The +1 accounts for inclusive range; adjust logic as per your data's inclusivity/exclusivity.
  const effectiveStartId = Math.max(fromTokenId, highestMembershipId + 1)

  // Ensure the calculation results in a non-negative value for effectiveRange.
  // This represents the number of new IDs we're interested in fetching.
  const effectiveRange = Math.max(0, toTokenId - effectiveStartId + 1)

  // Calculate the number of IDs being skipped because they're already accounted for.
  // This adjusts based on the effective start position.
  const skippedIds = effectiveStartId - fromTokenId

  console.log(`Fetched metadata for ${effectiveRange} IDs, NFTs, skipping ${skippedIds} existing IDs`)

  return metadata
}

async function fetchNFTMetadata(id) {
  const url = `https://nft-metadata.blackbird.xyz/v1/${id}.json`
  try {
    const response = await axios.get(url)
    const membershipId = id
    return { ...response.data, membershipId }
  } catch (error) {
    console.error(`Error fetching NFT data for ID ${id}:`, error)
    await insertData(DB_NAME, 'nftErrorFetchingMetadata', { error, id })
    return null
  }
}

function reformatNFTMetadata(nftMetadata) {
  const restaurantName = nftMetadata.attributes.find(attr => attr.trait_type === 'restaurantName').value
  const reformattedMetadata = {
    restaurantName: restaurantName,
    restaurantId: generateRestaurantId(restaurantName),
    location: nftMetadata.attributes.find(attr => attr.trait_type === 'restaurantLocations').value,
    imageArtist: nftMetadata.attributes.find(attr => attr.trait_type === 'artist').value,
    generation: nftMetadata.attributes.find(attr => attr.trait_type === 'generation').value,
    expirationDate: nftMetadata.attributes.find(attr => attr.trait_type === 'expirationDate').value,
    mintDate: nftMetadata.attributes.find(attr => attr.trait_type === 'mintDate').value,
    memberStatus: nftMetadata.attributes.find(attr => attr.trait_type === 'memberStatus').value,
    accessLevel: nftMetadata.attributes.find(attr => attr.trait_type === 'accessLevel').value,
    image: nftMetadata.image,
    name: nftMetadata.name,
    membershipId: nftMetadata.membershipId,
  }

  return reformattedMetadata
}

// 3)
async function writeMembershipsToDatabase(nftMetadata) {
  const db = await database() // Assuming this function correctly initializes and returns your db instance

  // Ensure the unique index exists - consider moving this to a database initialization script instead
  await db.collection('memberships').createIndex({ membershipId: 1 }, { unique: true })

  // Iterate through nftMetadata array and upsert each item
  for (const item of nftMetadata) {
    // Check for blank values in the restaurantName or restaurantId fields
    if (!item.restaurantName || !item.restaurantId) {
      console.log(`Skipping item with blank restaurantName or restaurantId: ${JSON.stringify(item)}`)
      continue // Skip this iteration if either field is blank
    }

    // Construct the query for updateOne method
    const query = { membershipId: item.membershipId }
    const update = { $set: item }
    const options = { upsert: true } // Ensure an insert if the document does not exist

    try {
      if (item.membershipId % 100 === 0) {
        console.log(`Processed membership: ${item.membershipId}`)
      }
      await db.collection('memberships').updateOne(query, update, options)
    } catch (error) {
      console.error(`Error updating/inserting membership record: ${error}`)
      await insertData(DB_NAME, 'membershipErrors', { error, data: item })
    }
  }
}

// 4)
async function findUniqueRestaurants(nftMetadata) {
  const uniqueRestaurants = new Map()
  const errors = []

  for (const nftData of nftMetadata) {
    if (!nftData || !nftData.restaurantName || !nftData.restaurantId) {
      errors.push({ error: 'Invalid NFT data or restaurantName/restaurantId missing', data: nftData })
      continue
    }

    const { restaurantName, restaurantId, accessLevel, memberStatus, image, imageArtist } = nftData

    // Ensure the restaurant is uniquely identified by its ID
    if (!uniqueRestaurants.has(restaurantId)) {
      uniqueRestaurants.set(restaurantId, {
        restaurantId,
        restaurantName: restaurantName,
        accessLevels: {},
      })
    }

    let restaurant = uniqueRestaurants.get(restaurantId)

    // Initialize or update the details for this access level
    const levelKey = String(accessLevel)
    restaurant.accessLevels[levelKey] = {
      count: 0, // count will get updated in addStatsToRestaurants() at the bottom of main()
      memberStatus,
      image,
      imageArtist,
    }
  }

  const formattedRestaurants = Array.from(uniqueRestaurants.values())

  console.log('New unique restaurants:', formattedRestaurants.length)
  return formattedRestaurants
}

// 5)
async function writeRestaurantsToDatabase(uniqueRestaurants) {
  const db = await database()
  await db.collection('restaurants').createIndex({ restaurantId: 1 }, { unique: true })

  for (const restaurant of uniqueRestaurants) {
    // Check for blank values in the name or restaurantId fields
    if (!restaurant.restaurantName || !restaurant.restaurantId) {
      console.log(`Skipping restaurant with blank name or restaurantId: ${JSON.stringify(restaurant)}`)
      continue // Skip this iteration if either field is blank
    }

    // Construct the query for updateOne method
    const query = { restaurantId: restaurant.restaurantId }
    const update = { $set: restaurant }
    const options = { upsert: true } // Ensure an insert if the document does not exist

    try {
      await db.collection('restaurants').updateOne(query, update, options)
      console.log(`Processed restaurant: ${restaurant.restaurantName}`)
    } catch (error) {
      console.error(`Error updating/inserting restaurant record: ${error}`)
      await insertData(DB_NAME, 'restaurantErrors', { error, data: restaurant })
    }
  }
}

// 6) Fetch all publish events from the blockchain
async function writeIPFSHashesToPendingHashesCollection() {
  const chunkSize = 2000
  const delayDuration = 1000

  const db = await database() // Assume database() gets your DB connection
  let startBlock = FIRST_EMIT_BLOCK

  // Determine the start block by finding the highest blockNumber in the checkIns collection
  const latestCheckIn = await db.collection('checkIns').findOne({}, { sort: { 'metadata.blockNumber': -1 } })
  if (latestCheckIn && latestCheckIn.metadata && latestCheckIn.metadata.blockNumber) {
    startBlock = latestCheckIn.metadata.blockNumber + 1
  }

  // Determine the current block height on the blockchain
  const toBlock = await provider.getBlockNumber()

  // Process logic remains largely unchanged, just adapt the loop to use dynamically determined start and end blocks
  const totalBlocks = toBlock - startBlock
  const totalChunks = Math.ceil(totalBlocks / chunkSize)
  const totalDelay = totalChunks * delayDuration
  const totalDelayInMinutes = totalDelay / 1000 / 60
  console.log(`Beginning to check events from block ${startBlock} to block ${toBlock}...`)
  console.log(
    `Estimated completion time: ${totalDelayInMinutes} minutes with a delay of ${delayDuration}ms between fetches.`
  )

  for (let currentStart = startBlock; currentStart <= toBlock; currentStart += chunkSize + 1) {
    let currentEnd = Math.min(currentStart + chunkSize, toBlock)
    console.log(`Fetching logs from block ${currentStart} to ${currentEnd}`)

    try {
      const chunkEvents = await provider.getLogs({
        fromBlock: ethers.utils.hexValue(currentStart),
        toBlock: ethers.utils.hexValue(currentEnd),
        address: publishCa,
        topics: [ethers.utils.id('ActionSnapshot(string)')],
      })

      console.log(`Fetched ${chunkEvents.length} events`)

      const pendingHashes = chunkEvents.map(event => {
        const parsedLog = publishContract.interface.parseLog(event)
        let ipfsURI = parsedLog.args.attestationURI
        ipfsURI = ipfsURI.startsWith('ipfs://') ? ipfsURI.substring(7) : ipfsURI
        return {
          ipfsHash: ipfsURI,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash,
        }
      })

      // avoid duplicates by filtering out hashes that are already in the database
      const existingHashes = await getPendingIPFSHashes()
      const uniquePendingHashes = pendingHashes.filter(
        pendingHash => !existingHashes.some(existingHash => existingHash.ipfsHash === pendingHash.ipfsHash)
      )

      // Insert the batch of pending hashes into the database
      if (uniquePendingHashes.length === 0) {
        console.log('No new hashes to insert.')
      } else {
        await insertData(DB_NAME, 'pendingHashes', uniquePendingHashes)
        console.log(`Inserted ${pendingHashes.length} records into pendingHashes collection`)
      }

      await delay(delayDuration) // Delay to prevent rate limiting
    } catch (error) {
      console.error(`Error fetching logs for blocks ${startBlock} to ${toBlock}:`, error)
    }
  }

  console.log('Finished fetching and recording publish events.')
}

// 7) Fetch pending hashes from the pending hashes collection
async function getPendingIPFSHashes() {
  const db = await database()
  if (!db) {
    console.error('Failed to connect to MongoDB.')
    return
  }

  const pendingHashes = await db.collection('pendingHashes').find({}).toArray()
  return pendingHashes
}

function reformatCheckInData(checkInData, blockNumber, transactionHash, ipfsHash) {
  const { check_in_id, restaurant_name, created_at } = checkInData
  const reformattedData = {
    checkInId: check_in_id,
    restaurantName: restaurant_name,
    restaurantId: generateRestaurantId(restaurant_name),
    createdAt: created_at,
  }
  return {
    ...reformattedData,
    metadata: { blockNumber, transactionHash, ipfsHash },
  }
}

// 8)
async function fetchAndPublishIPFSDataInBatches(hashes, batchSize = 50) {
  const db = await database()

  // Ensure there's a unique index on check_in_id to prevent duplicate entries
  await db.collection('checkIns').createIndex({ checkInId: 1 }, { unique: true })

  if (!hashes || hashes.length === 0) {
    console.log('No hashes to fetch.')
    return
  }

  for (let i = 0; i < hashes.length; i += batchSize) {
    const batch = hashes.slice(i, i + batchSize)
    console.log(`Processing batch ${Math.ceil(i / batchSize) + 1} of IPFS data...`)

    for (const { ipfsHash, blockNumber, transactionHash } of batch) {
      const records = await fetchIPFSData(ipfsHash, blockNumber, transactionHash)
      for (const record of records) {
        // Skip records with blank checkInId
        if (!record.checkInId || record.checkInId === '') {
          console.log(`Skipping record with blank checkInId: ${JSON.stringify(record)}`)
          continue
        }

        const query = { checkInId: record.checkInId }
        const update = { $set: { ...record, metadata: { blockNumber, transactionHash, ipfsHash } } }
        const options = { upsert: true }

        try {
          await db.collection('checkIns').updateOne(query, update, options)
        } catch (error) {
          console.error(`Error upserting check-in record: ${error}`)
          await insertData(DB_NAME, 'checkInErrors', { error, data: record })
        }
      }

      // Delay to avoid rate limiting, consider using async delay
      await delay(500)
    }

    // Delete processed hashes after successful data handling
    for (const { ipfsHash } of batch) {
      await db.collection('pendingHashes').deleteOne({ ipfsHash })
    }
  }

  console.log('Finished fetching and inserting IPFS data.')
}

async function fetchIPFSData(hash, blockNumber, transactionHash) {
  const url = `https://cloudflare-ipfs.com/ipfs/${hash}`
  try {
    const response = await axios.get(url)
    if (response.status === 200) {
      return response.data.records.map(record => reformatCheckInData(record, blockNumber, transactionHash, hash))
    } else {
      console.error(`Failed to fetch IPFS data for hash ${hash}: HTTP status ${response.status}`)
      return []
    }
  } catch (error) {
    console.error(`Error fetching IPFS data for hash ${hash}:`, error)
    return [] // Return empty array to maintain consistency
  }
}

async function updateLatestMembershipDetailsToTiers() {
  const db = await database()
  // Fetch all unique restaurantIds
  const restaurantIds = await db.collection('restaurants').distinct('restaurantId')

  for (const restaurantId of restaurantIds) {
    // Fetch the restaurant document
    const restaurant = await db.collection('restaurants').findOne({ restaurantId })
    if (!restaurant || !restaurant.accessLevels) continue

    // Iterate over each access level in the restaurant
    for (const level in restaurant.accessLevels) {
      // Find the latest membership for this restaurantId and accessLevel
      const latestMembership = await db.collection('memberships').findOne(
        { restaurantId, accessLevel: parseInt(level) },
        { sort: { membershipId: -1 } } // Sort by membershipId descending to get the latest
      )

      if (latestMembership) {
        // Prepare the update for the specific fields
        const updateFields = {
          [`accessLevels.${level}.image`]: latestMembership.image,
          [`accessLevels.${level}.imageArtist`]: latestMembership.imageArtist,
          [`accessLevels.${level}.memberStatus`]: latestMembership.memberStatus,
        }

        // Update the restaurant document with the latest membership details
        await db.collection('restaurants').updateOne({ restaurantId }, { $set: updateFields })

        console.log(`Updated restaurant ${restaurantId} level ${level} with latest membership details.`)
      }
    }
  }
}

// 9)
async function enhanceRestaurants() {
  // await initializeTiers()
  const db = await database()
  const uniqueRestaurants = await db.collection('memberships').distinct('restaurantId')

  for (const restaurantId of uniqueRestaurants) {
    const restaurant = await db.collection('restaurants').findOne({ restaurantId })
    // const uniqueAccessLevels = await db
    //   .collection('memberships')
    //   .distinct('accessLevel', { restaurantId: restaurantId })
    if (!restaurant || !restaurant.accessLevels) continue

    // Update colors for each tier level
    // await updateTierLevelColors(restaurantId, uniqueAccessLevels)

    // // Update counts for each tier level
    await updateTierLevelCounts(restaurantId)
    await updateRestaurantTierDetails(restaurantId)
  }
}

async function initializeTiers() {
  const db = await database()
  const uniqueRestaurantIds = await db.collection('memberships').distinct('restaurantId')

  for (const restaurantId of uniqueRestaurantIds) {
    // Fetch all memberships for this restaurantId
    const memberships = await db.collection('memberships').find({ restaurantId }).toArray()

    // Organize access levels by level
    let accessLevels = {}
    for (const membership of memberships) {
      const { accessLevel, image, imageArtist, memberStatus } = membership

      // If this is the first membership of its access level, initialize the tier
      if (!accessLevels[accessLevel]) {
        accessLevels[accessLevel] = { image, imageArtist, memberStatus, count: 0, whiteText: true, accent: '#ffffff' }
      }
    }

    // Update the restaurant document with the organized access levels
    const updateResult = await db
      .collection('restaurants')
      .updateOne({ restaurantId }, { $set: { accessLevels } }, { upsert: true })

    console.log(`Updated restaurantId ${restaurantId} with access levels:`, updateResult)
  }
}

async function updateRestaurantTierDetails(restaurantId) {
  const db = await database()
  const restaurant = await db.collection('restaurants').findOne({ restaurantId })

  if (!restaurant) return

  for (const level in restaurant.accessLevels) {
    const details = restaurant.accessLevels[level]

    try {
      const newDetails = await processImageForTier(details.image)

      const updateObject = {}
      for (const key in newDetails) {
        if (newDetails[key] !== undefined) {
          updateObject[`accessLevels.${level}.${key}`] = newDetails[key]
        }
      }

      console.log(`Updating restaurantId: ${restaurantId}, level: ${level} with:`, updateObject)
      await db.collection('restaurants').updateOne({ restaurantId }, { $set: updateObject })
    } catch (error) {
      console.error(`Error updating restaurantId: ${restaurantId}, level: ${level}`, error)
    }
  }
}

async function processImageForTier(imageUrl) {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette()
    const vibrantColor = palette.Vibrant?.getRgb()
    if (!vibrantColor) {
      throw new Error('Vibrant color not found')
    }

    // Convert RGB to Hex
    const hexColor = `#${rgbHex(vibrantColor[0], vibrantColor[1], vibrantColor[2])}`

    // Determine if white text should be used
    const whiteText = shouldBeWhiteText(hexColor)

    return { accent: hexColor, whiteText }
  } catch (error) {
    console.error('Error processing image:', error)
    // Return default values or handle the error appropriately
    return { accent: '#000000', whiteText: true } // Default or error values
  }
}

async function updateTierLevelCounts(restaurantId) {
  const db = await database()

  const countsPerAccessLevel = await db
    .collection('memberships')
    .aggregate([{ $match: { restaurantId } }, { $group: { _id: '$accessLevel', count: { $sum: 1 } } }])
    .toArray()

  for (const { _id, count } of countsPerAccessLevel) {
    console.log(`Updating restaurantId: ${restaurantId}, level: ${_id} with count: ${count}`)
    await db
      .collection('restaurants')
      .updateOne(
        { restaurantId, [`accessLevels.${_id}`]: { $exists: true } },
        { $set: { [`accessLevels.${_id}.count`]: count } }
      )
  }
}

function shouldBeWhiteText(backgroundColor, contrastThreshold = 2) {
  return wcagContrast.hex('#FFFFFF', backgroundColor) >= contrastThreshold
}

// 10)
async function calculateGlobalStats() {
  const db = await database()
  const now = new Date()
  const startOfTodayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0))
  if (now.getUTCHours() < 4) {
    // If before 4 AM UTC, count from the previous day
    startOfTodayUTC.setDate(startOfTodayUTC.getDate() - 1)
  }

  // Total Check-ins
  const totalCheckins = await db.collection('checkIns').countDocuments()

  // Check-ins Today
  const checkInsToday = await db.collection('checkIns').countDocuments({ created_at: { $gte: startOfTodayUTC } })

  // Check-ins Per Member
  // First, find the total number of unique members who have checked in
  const uniqueMembers = await db.collection('checkIns').distinct('memberId')
  const checkInsPerMember = totalCheckins / uniqueMembers.length

  // Update or Insert Global Stats in the globalStats collection
  await db.collection('globalStats').updateOne(
    { stat: 'global' }, // A unique identifier for the global stats document
    {
      $set: {
        totalCheckins,
        checkInsToday,
        checkInsPerMember,
        lastUpdated: new Date(), // Keep track of when the stats were last updated
      },
    },
    { upsert: true } // Create the document if it doesn't exist
  )
}
