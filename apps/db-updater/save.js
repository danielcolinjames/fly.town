require("dotenv").config()
const ethers = require("ethers")
const axios = require("axios")
const {
  connect,
  insertData,
  database,
  disconnect,
} = require("../../packages/db/connect")
const { delay, generateRestaurantId } = require("../../packages/utils")
const { DB_NAME } = require("../../packages/db/globals")
const fs = require("fs")

async function saveCheckInsToCsv() {
  await connect()
  console.log("Connected to MongoDB")
  console.log({ DB_NAME })

  const db = await database()

  const checkIns = await db.collection("checkIns").find({}).toArray()
  await disconnect()
  const csvHeader = "Restaurant,CheckInId,Timestamp\n"
  const csvContent = checkIns
    .map((checkIn) => {
      return `${checkIn.restaurantName},${checkIn.checkInId},${checkIn.createdAt}`
    })
    .join("\n")
  const csv = csvHeader + csvContent
  fs.writeFileSync("checkIns.csv", csv)
}

async function saveMemberships() {
  await connect()
  console.log("Connected to MongoDB")
  console.log({ DB_NAME })

  const db = await database()

  const memberships = await db.collection("memberships").find({}).toArray()
  await disconnect()
  const csvHeader =
    "Membership ID,Access Level,Generation,Location,Mint Date,Restaurant Name,Member Status\n"
  const csvContent = memberships
    .map((membership) => {
      return `${membership.membershipId},${membership.accessLevel},${membership.generation},${membership.location},${membership.mintDate},${membership.restaurantName},${membership.memberStatus}`
    })
    .join("\n")
  const csv = csvHeader + csvContent
  fs.writeFileSync("memberships.csv", csv)
}

async function main() {
  // await saveCheckInsToCsv()
  await saveMemberships()
}

main()
