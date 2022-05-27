const { ethers } = require("hardhat");

const data = [
  {
    name: "DAI / USD",
    token: "0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f",
    aggregator: "0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046",
  },
  {
    name: "USDT / USD",
    token: "0xa02f6adc7926efebbd59fd43a84f4e0c0c91e832",
    aggregator: "0x92C09849638959196E976289418e5973CC96d645",
  },
  {
    name: "USDC / USD",
    token: "0xe6b8a5cf854791412c1f6efc7caf629f5df1c747",
    aggregator: "0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0",
  },
  {
    name: "MATIC / USD",
    token: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    aggregator: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
  },
];

async function main() {
  const PriceFeed = await ethers.getContractFactory("PriceFeed");
  const priceFeed = await PriceFeed.deploy();
  await priceFeed.deployed();

  console.log(`PriceFeed deployed ${priceFeed.address}`);
  await addInitialPriceFeedAggregators(priceFeed);
  await getPrices(priceFeed);
}

async function addInitialPriceFeedAggregators(priceFeed) {
  for (let i = 0; i < data.length; i++) {
    const d = data[i];

    const tx = await priceFeed.addPriceFeedAggregator(d.token, d.aggregator);
    await tx.wait();
  }
}

async function getPrices(priceFeed) {
  for (let i = 0; i < data.length; i++) {
    const d = data[i];

    const price = await priceFeed.getLatestPrice(d.token);
    console.log(
      `${d.name}: ${Number(price.value) / Math.pow(10, price.decimals)}`
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
