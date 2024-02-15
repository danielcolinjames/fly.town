require('dotenv').config()
const { MongoClient } = require('mongodb')
const fs = require('fs')
const csv = require('fast-csv')
const path = require('path')

const connectionString = process.env.CONNECTION_STRING
const client = new MongoClient(connectionString)
const { delay, slugify } = require('../utils/index')

async function initializeRestaurantsCollection() {
  try {
    console.log('CONNECTING TO DB...')
    await client.connect()
    console.log('Connected to MongoDB')
    const database = client.db('flytown')
    const checkins = database.collection('checkins')
    const restaurants = database.collection('restaurants')

    // Find all unique restaurant names
    const uniqueNames = await checkins.distinct('restaurant_name')

    // Slugify and insert into the restaurants collection
    for (const name of uniqueNames) {
      const restaurant_id = slugify(name)
      await restaurants.updateOne(
        { restaurant_id: restaurant_id },
        { $setOnInsert: { full_name: name, restaurant_id: restaurant_id } },
        { upsert: true }
      )
    }

    console.log('Restaurants collection has been initialized.')
  } catch (e) {
    console.error(e)
  }
}

async function exportCheckInsToCSV() {
  try {
    await client.connect()
    const database = client.db('flytown')
    const checkins = database.collection('checkins')

    const cursor = checkins.find({}) //, { projection: { metadata: 0 } }) // Exclude metadata field
    const csvStream = csv.format({ headers: true })
    const writableStream = fs.createWriteStream('checkins-with-metadata.csv')

    writableStream.on('finish', () => console.log('Done writing check-ins to CSV.'))
    csvStream.pipe(writableStream)
    await cursor.forEach(doc => {
      csvStream.write(doc)
    })
    csvStream.end()
  } catch (e) {
    console.error(e)
  }
}

async function createNameToSlugMap() {
  const map = new Map()
  try {
    await client.connect()
    const database = client.db('flytown')
    const restaurants = database.collection('restaurants')
    const cursor = restaurants.find({})
    await cursor.forEach(doc => {
      map.set(doc.full_name, slugify(doc.full_name))
    })
  } catch (e) {
    console.error(e)
  }
  return map
}

async function updateCheckInsWithRestaurantId() {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    const database = client.db('flytown')
    const checkins = database.collection('checkins')
    const restaurants = database.collection('restaurants')

    const nameToSlugMap = await createNameToSlugMap()

    // Convert cursor to array for async iteration
    const allCheckins = await checkins.find({}).toArray()
    // console.log('nameToSlugMap: ', nameToSlugMap)
    for (const checkin of allCheckins) {
      const slug = nameToSlugMap.get(checkin.restaurant_name)
      // console.log('slug: ', slug)
      const restaurant = await restaurants.findOne({ restaurant_id: slug })
      // console.log('restaurant: ', restaurant)
      if (restaurant) {
        if (checkin.restaurant_id !== restaurant.restaurant_id) {
          // every 100, wait 1 second and log
          if (checkin.check_in_id % 100 === 0) {
            await delay(1000)
            console.log(`Updating check in ${checkin.check_in_id} with restaurant_id: ${restaurant.restaurant_id}`)
          }
          await checkins.updateOne(
            { check_in_id: checkin.check_in_id },
            { $set: { restaurant_id: restaurant.restaurant_id } }
          )
        } else {
          console.log(`Check in ${checkin.check_in_id} already has the correct restaurant_id`)
        }
      } else {
        console.log(`No restaurant found for slug: ${slug}`)
      }
    }

    console.log('Complete')
  } catch (e) {
    console.error('Error during the dry run:', e)
  } finally {
    await client.close()
    console.log('Disconnected from MongoDB')
  }
}

async function main() {
  // await initializeRestaurantsCollection()
  // await exportCheckInsToCSV()
  await updateCheckInsWithRestaurantId()
}

main().catch(console.error)
