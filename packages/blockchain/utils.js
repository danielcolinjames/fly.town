const ethers = require('ethers');

// contract with Publish function
const ca = "0xe6734CA85163726ab94d6240c6BbabecC4436803"

const abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"string","name":"attestationURI","type":"string"}],"name":"ActionSnapshot","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_attestationURI","type":"string"}],"name":"publish","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]

const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
const contract = new ethers.Contract(ca, abi, provider);

module.exports = {
    ca, abi, contract, provider
};