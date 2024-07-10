const { ethers } = require("hardhat");
const { BigNumber, utils } = require("ethers");

const keyhash = "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc";
const subId = 1;

async function deployFibril() {
    const [deployer, ...accounts] = await ethers.getSigners();
    const fibrilFactory = await ethers.getContractFactory("Fibril");
    const contract = await fibrilFactory.connect(deployer).deploy()
    const fibril = await contract.deployed()

    const nftUtil = await deployFibrilNFTUtil()
    const vrf = await deployVRFCoordinatorV2Mock()
    const rwg = await deployRandomWordsGenerator(vrf, fibril)

    await fibril.initialize(nftUtil.address, rwg.address)

    return { nftUtil, fibril, vrf, rwg }
}

async function deployMockToken() {
    const [deployer] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("MockToken");
    const supply = utils.parseUnits("100000", 18);
    const contract = await tokenFactory.connect(deployer).deploy(supply);
    return await contract.deployed();

}

async function deployFibrilNFTUtil() {
    const [deployer] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("FibrilNFTUtility");
    const deploy = await tokenFactory.connect(deployer).deploy();
    const contract = await deploy.deployed();

    await contract.initialize();
    return contract
}

async function deployRandomWordsGenerator(vrf, fibril) {
    const [deployer] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("RandomWordsGenerator");
    const deploy = await tokenFactory.connect(deployer).deploy(vrf.address, keyhash, subId);
    const contract = await deploy.deployed();

    await contract.setFibrilAddress(fibril.address);
    return contract
}

async function deployVRFCoordinatorV2Mock() {
    const [deployer] = await ethers.getSigners();
    const VRFFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    const deploy = await VRFFactory.connect(deployer).deploy(100000000000000000n, 1000000000n);
    const vrf = await deploy.deployed();

    await vrf.createSubscription();
    await vrf.fundSubscription(subId, 1000000000000000000000000n);
    return vrf
}

module.exports = { deployFibril, deployMockToken };