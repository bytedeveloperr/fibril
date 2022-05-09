const { ethers, upgrades } = require("hardhat")

const main = async () => {
  // const FibrilNFTMarketplace = await ethers.getContractFactory("FibrilNFTMarketplace")
  // const fibrilNFTMarketplace = await upgrades.deployProxy(FibrilNFTMarketplace, [], { initializer: "initialize" })
  // await fibrilNFTMarketplace.deployed()

  // console.log(`fibril nft marketplace v1 deployed ${fibrilNFTMarketplace.address}`)
  
  const Fibril = await ethers.getContractFactory("Fibril")
  const fibril = await upgrades.deployProxy(Fibril, [], { initializer: "initialize" })
  await fibril.deployed()

  console.log(`fibril v1 deployed ${fibril.address}`)
}

main().catch(console.log)
