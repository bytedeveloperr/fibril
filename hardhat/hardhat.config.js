require("@nomiclabs/hardhat-waffle")
require("@openzeppelin/hardhat-upgrades")
require("@nomiclabs/hardhat-etherscan")
require("solidity-coverage")

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.2",
  networks: {
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com",
      accounts: ["39c16e02ed1cf0b311aab5967d9e972535a7fd6c98b4a2914df723f1cb25900b", "3ec2a4a3e3836c16edb20b6613a9dcb994934d4e03e6ea17c7428eb67002a680"],
      gas: 5000000,
    },
  },
  etherscan: {
    apiKey: "7DGGU4H2T83KBMCAPXWZM3UNCFYA5SEVIC",
  },
}
