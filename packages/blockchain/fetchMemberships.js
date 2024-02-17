require('dotenv').config()
const axios = require('axios')
const { delay, slugify } = require('../utils')
const { client, disconnect } = require('../db/connect')

const db = client.db('flytown')

async function fetchNFTData(id) {
  const url = `https://nft-metadata.blackbird.xyz/v1/${id}.json`
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    console.error(`Error fetching NFT data for ID ${id}:`, error)
    return null
  }
}
async function processNFTData(nftData) {
  const restaurantName = nftData.attributes.find(attr => attr.trait_type === 'restaurantName').value
  const restaurant_id = slugify(restaurantName)
  const image = nftData.image
  const imageArtist = nftData.attributes.find(attr => attr.trait_type === 'artist').value
  const location = nftData.attributes.find(attr => attr.trait_type === 'restaurantLocations').value
  const accessLevel = nftData.attributes.find(attr => attr.trait_type === 'accessLevel').value
  const memberStatus = nftData.attributes.find(attr => attr.trait_type === 'memberStatus').value

  // Construct the update object for the accessLevels
  const accessLevelKey = `accessLevels.${accessLevel}`
  const accessLevelsUpdate = {
    [`${accessLevelKey}.memberStatus`]: memberStatus,
    [`${accessLevelKey}.image`]: image, // NFT image for the specific accessLevel
    [`${accessLevelKey}.imageArtist`]: imageArtist, // Assigning the artist to the specific accessLevel
  }

  // Update or insert restaurant information with the new accessLevels structure
  await db.collection('restaurants').updateOne(
    { restaurant_id },
    {
      $setOnInsert: { restaurant_id, imageArtist, location },
      $set: accessLevelsUpdate,
    },
    { upsert: true }
  )

  // Insert the raw NFT data into the "memberships" collection
  await db.collection('memberships').insertOne(nftData)
}

const from = 1
const to = 35139

async function main() {
  for (let id = from; id <= to; id++) {
    const nftData = await fetchNFTData(id)
    delay(250) // Delay to prevent rate limiting
    console.log(`Fetched membership ${id}`)
    if (nftData) {
      await processNFTData(nftData)
      console.log(`Uploaded membership ${id} to database`)
    }
  }
  // Cleanup
  await disconnect()
  console.log('Processing complete.')
}

main().catch(console.error)