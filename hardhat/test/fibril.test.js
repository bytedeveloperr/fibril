const { expect } = require("chai");
const { deployFibril, deployMockToken } = require("./utils");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const NULL_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const MOCK_NFT_URI = "ipfs://QmVDae8m3X6HZf9v2Jnyqe53Xpj64vEvQDUci1NpX1Krcs"

async function approveAndSupportWithERC20(fibril, token, creator, amount) {
    await token.approve(fibril.address, amount);
    await fibril.support(creator.address, token.address, amount)
}

async function supportWithETH(fibril, creator, amount) {
    return await fibril.supportWithETH(creator.address, { value: amount });
}

async function approveAndSupportWithNFT(fibril, nft, creator, tokenId) {
    await nft.approve(fibril.address, tokenId);
    await fibril.supportWithNFT(creator.address, nft.address, tokenId)
}

async function withdrawETH(fibril, creator, amount) {
    await fibril.connect(creator)
        .withdraw(NULL_ADDRESS, creator.address, amount)
}

async function withdrawERC20(fibril, token, creator, amount) {
    await fibril.connect(creator)
        .withdraw(token.address, creator.address, amount)
}

describe('Fibril', () => {
    let fibril, nftUtil, token, signers, nftContract, vrfContract, rwgContract;

    beforeEach(async () => {
        let deployment = await deployFibril()

        fibril = deployment.fibril
        nftUtil = deployment.nftUtil
        vrfContract = deployment.vrf
        rwgContract = deployment.rwg
        token = await deployMockToken()
        signers = await ethers.getSigners();

        const nftAddress = await nftUtil.getNFTContractAddress()
        nftContract = await ethers.getContractAt("FibrilNFT", nftAddress)
    })

    it('should deploy fibril', () => {
        expect(fibril.address.startsWith("0x"), "contract address is invalid").to.equal(true)
        expect(fibril.address, "contract address cannot be zero address").to.not.hexEqual(ZERO_ADDRESS)
    });

    it('Support Creator with ETH', async () => {
        const creator = signers[1];
        const supportAmount = utils.parseEther("1");

        await supportWithETH(fibril, creator, supportAmount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expect(creatorBalance, `creator balance should be ${supportAmount}`).to.equal(supportAmount)
    })

    it('Support Creator with ERC20 Token', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const supportAmount = utils.parseUnits("100", 18);

        const initialSupporterBalance = await token.balanceOf(supporter.address)

        await approveAndSupportWithERC20(fibril, token, creator, supportAmount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, token.address)
        const finalSupporterBalance = await token.balanceOf(supporter.address)

        const expectedSupporterBalance = initialSupporterBalance.sub(supportAmount)
        expect(creatorBalance, `creator balance should be ${supportAmount}`).to.equal(supportAmount)
        expect(finalSupporterBalance, `supporter balance should be ${expectedSupporterBalance}`).to.equal(expectedSupporterBalance)
    })

    it('Support Creator with NFT', async () => {
        const supporter = signers[0]; // same as deployer
        const creator = signers[1];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        const initialNFTOwner = await nftContract.ownerOf("1")
        expect(initialNFTOwner).to.equal(supporter.address)

        await approveAndSupportWithNFT(fibril, nftContract, creator, "1");
        const newNFTOwner = await nftContract.ownerOf("1")
        expect(newNFTOwner).to.equal(fibril.address)
    })

    it('Withdraw ERC20 Token by Creator', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const supportAmount = utils.parseUnits("100", 18);

        const initialSupporterBalance = await token.balanceOf(supporter.address)

        await approveAndSupportWithERC20(fibril, token, creator, supportAmount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, token.address)
        const finalSupporterBalance = await token.balanceOf(supporter.address)

        const expectedSupporterBalance = initialSupporterBalance.sub(supportAmount)
        expect(creatorBalance, `creator balance should be ${supportAmount}`).to.equal(supportAmount)
        expect(finalSupporterBalance, `supporter balance should be ${expectedSupporterBalance}`).to.equal(expectedSupporterBalance)

        const withdrawAmount = utils.parseUnits("5", 18);
        await withdrawERC20(fibril, token, creator, withdrawAmount)

        const expectedBalance = supportAmount.sub(withdrawAmount)
        const newCreatorBalance = await fibril.getCreatorBalance(creator.address, token.address)
        expect(newCreatorBalance, `creator address balance should be ${expectedBalance}`).to.equal(expectedBalance)
    })


    it('Withdraw ETH by Creator', async () => {
        const creator = signers[1];
        const supportAmount = utils.parseEther("1");

        await supportWithETH(fibril, creator, supportAmount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expect(creatorBalance, `creator balance should be ${supportAmount}`).to.equal(supportAmount)

        const withdrawAmount = utils.parseEther("0.5");
        await withdrawETH(fibril, creator, withdrawAmount);

        const newCreatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        const expectedBalance = supportAmount.sub(withdrawAmount)
        expect(newCreatorBalance, `creator balance should be ${expectedBalance}`).to.equal(expectedBalance)
    })

    it('Withdraw NFT by creator', async () => {
        const supporter = signers[0]; // same as deployer
        const creator = signers[1];
        const other = signers[2];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        const initialNFTOwner = await nftContract.ownerOf("1")
        expect(initialNFTOwner).to.equal(supporter.address)

        await approveAndSupportWithNFT(fibril, nftContract, creator, "1");
        const newNFTOwner = await nftContract.ownerOf("1")
        expect(newNFTOwner).to.equal(fibril.address)

        await fibril.connect(creator).withdrawNFT(other.address, nftContract.address, "1")
        const newANFTOwner = await nftContract.ownerOf("1")
        expect(newANFTOwner).to.equal(other.address)
    })


    it('Support Creator and list with NFT', async () => {
        const supporter = signers[0]; // same as deployer
        const creator = signers[1];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        const initialNFTOwner = await nftContract.ownerOf("1")
        expect(initialNFTOwner).to.equal(supporter.address)

        await approveAndSupportWithNFT(fibril, nftContract, creator, "1");
        const newNFTOwner = await nftContract.ownerOf("1")
        expect(newNFTOwner).to.equal(fibril.address)

        // ddress _nftAddress, uint256 _tokenId, address _paymentToken, uint256 _pricePerItem
        await fibril.connect(creator).listNft(nftContract.address, "1", NULL_ADDRESS, utils.parseEther("0.02"))

        const listing = await nftUtil.getListing(nftContract.address, creator.address, "1")
        expect(listing.pricePerItem).to.equal(utils.parseEther("0.02"))
        expect(listing.listedBy).to.equal(creator.address)
        expect(listing.nftAddress).to.equal(nftContract.address)
        expect(listing.paymentToken).to.equal(NULL_ADDRESS)
    })

    it('Support Creator and close list with NFT', async () => {
        const supporter = signers[0]; // same as deployer
        const creator = signers[1];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        const initialNFTOwner = await nftContract.ownerOf("1")
        expect(initialNFTOwner).to.equal(supporter.address)

        await approveAndSupportWithNFT(fibril, nftContract, creator, "1");
        const newNFTOwner = await nftContract.ownerOf("1")
        expect(newNFTOwner).to.equal(fibril.address)

        // ddress _nftAddress, uint256 _tokenId, address _paymentToken, uint256 _pricePerItem
        await fibril.connect(creator).listNft(nftContract.address, "1", NULL_ADDRESS, utils.parseEther("0.02"))

        const listing = await nftUtil.getListing(nftContract.address, creator.address, "1")
        expect(listing.pricePerItem).to.equal(utils.parseEther("0.02"))
        expect(listing.listedBy).to.equal(creator.address)
        expect(listing.nftAddress).to.equal(nftContract.address)
        expect(listing.paymentToken).to.equal(NULL_ADDRESS)

        await fibril.connect(creator).closeNftListing(nftContract.address, "1")

        const listing2 = await nftUtil.getListing(nftContract.address, creator.address, "1")
        expect(listing2.listedBy).to.equal(ZERO_ADDRESS)
        expect(listing2.nftAddress).to.equal(ZERO_ADDRESS)
        expect(listing2.paymentToken).to.equal(ZERO_ADDRESS)
    })

    it('Support Creator and buy list with NFT', async () => {
        const supporter = signers[0]; // same as deployer
        const creator = signers[1];
        const buyer = signers[2];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        const initialNFTOwner = await nftContract.ownerOf("1")
        expect(initialNFTOwner).to.equal(supporter.address)

        await approveAndSupportWithNFT(fibril, nftContract, creator, "1");
        const newNFTOwner = await nftContract.ownerOf("1")
        expect(newNFTOwner).to.equal(fibril.address)

        // ddress _nftAddress, uint256 _tokenId, address _paymentToken, uint256 _pricePerItem
        await fibril.connect(creator).listNft(nftContract.address, "1", NULL_ADDRESS, utils.parseEther("0.02"))

        const listing = await nftUtil.getListing(nftContract.address, creator.address, "1")
        expect(listing.pricePerItem).to.equal(utils.parseEther("0.02"))
        expect(listing.listedBy).to.equal(creator.address)
        expect(listing.nftAddress).to.equal(nftContract.address)
        expect(listing.paymentToken).to.equal(NULL_ADDRESS)

        await fibril.connect(buyer).buyItem(creator.address, nftContract.address, "1", NULL_ADDRESS, utils.parseEther("0.02"), { value: utils.parseEther("0.02") })

        const newNFTOwner2 = await nftContract.ownerOf("1")
        expect(newNFTOwner2).to.equal(buyer.address)
    })

    it('support ETH by Creator', async () => {
        const creator = signers[1];
        const supportAmount = utils.parseEther("1");

        await supportWithETH(fibril, creator, supportAmount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expect(creatorBalance, `creator balance should be ${supportAmount}`).to.equal(supportAmount)

        const rewardAmount = utils.parseEther("0.05");
        await fibril.connect(creator).rewardRandomSupporters(1, NULL_ADDRESS, rewardAmount)

        const requestId = await fibril.getRewardRequestIds(creator.address);

        await vrfContract.fulfillRandomWords(requestId, rwgContract.address);

        const newCreatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        const expectedBalance = supportAmount.sub(rewardAmount)
        expect(newCreatorBalance, `creator balance should be ${expectedBalance}`).to.equal(expectedBalance)
    })
});