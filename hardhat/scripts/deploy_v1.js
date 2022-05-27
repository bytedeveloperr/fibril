const { ethers, upgrades } = require("hardhat");


const main = async () => {
  const vrfCoordinator = "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed";
  const keyHash = "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f"
  const subscriptionId = 386;

  const RandomWordsGenerator = await ethers.getContractFactory("RandomWordsGenerator");
  const randomWordsGenerator = await RandomWordsGenerator.deploy(vrfCoordinator, keyHash, subscriptionId)
  
  await randomWordsGenerator.deployed();

  console.log(`random words generator deployed ${randomWordsGenerator.address}`);

  const FibrilNFTUtility = await ethers.getContractFactory("FibrilNFTUtility");
  const fibrilNFTUtility = await upgrades.deployProxy(FibrilNFTUtility, [], {
    initializer: "initialize",
  });
  await fibrilNFTUtility.deployed();

  console.log(`fibril nft utility v1 deployed ${fibrilNFTUtility.address}`);

  const Fibril = await ethers.getContractFactory("Fibril");
  const fibril = await upgrades.deployProxy(
    Fibril,
    [fibrilNFTUtility.address, randomWordsGenerator.address],
    { initializer: "initialize" }
  );
  await fibril.deployed();

  const tx = await randomWordsGenerator.setFibrilAddress(fibril.address);
  await tx.wait()

  console.log(`fibril v1 deployed ${fibril.address}`);
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
