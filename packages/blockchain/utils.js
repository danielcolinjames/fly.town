const ethers = require("ethers");
const { publishAbi, nftAbi } = require("./contracts");

// contract with Publish function
const publishCa = "0xe6734CA85163726ab94d6240c6BbabecC4436803";

// const nftCa = '0x93433D3E2349Aa6077A0d4bc3E570Efa71a7eab6'
// const nftCa = '0x1dE409fC7613C234655f566A2969dD8a862E38B4'
// const nftCa = '0x93433D3E2349Aa6077A0d4bc3E570Efa71a7eab6'
const nftCa = "0x1dE409fC7613C234655f566A2969dD8a862E38B4";

const provider = new ethers.providers.JsonRpcProvider(
  "https://mainnet.base.org",
);

const publishContract = new ethers.Contract(publishCa, publishAbi, provider);
const nftContract = new ethers.Contract(nftCa, nftAbi, provider);

const FIRST_EMIT_BLOCK = 2_637_424; // block of earliest txn on publish contract

module.exports = {
  FIRST_EMIT_BLOCK,
  publishCa,
  nftCa,
  publishAbi,
  nftAbi,
  publishContract,
  nftContract,
  provider,
};
