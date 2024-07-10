const { expect } = require("chai");
const { deployFibril, deployMockToken } = require("./deploy_utils");
const { approveAndSupportWithERC20, supportWithETH, approveAndSupportWithNFT, withdrawETH, withdrawERC20, withdrawNFT, listCreatorNFT, closeNFTListing, buyNFTWithETH, rewardRandomSupportersWithETH } = require("./fibril_utils");
const { ethers } = require("hardhat");
const { utils } = require("ethers");

const MOCK_TOKEN_ID = "1";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const NULL_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
const MOCK_NFT_URI = "ipfs://QmVDae8m3X6HZf9v2Jnyqe53Xpj64vEvQDUci1NpX1Krcs"


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

    it('Should deploy fibril', () => {
        expect(fibril.address.startsWith("0x"), "contract address is invalid").to.equal(true)
        expect(fibril.address, "contract address cannot be zero address").to.not.hexEqual(ZERO_ADDRESS)
    });

    it('Support Creator with ETH', async () => {
        const creator = signers[0];
        const supporter = signers[1];
        const amount = utils.parseEther("1");

        await supportWithETH(fibril, supporter, creator.address, amount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expect(creatorBalance, `creator balance should be ${amount}`).to.equal(amount)
    })

    it('Support Creator with ERC20 Token', async () => {
        const creator = signers[1];

        // using the token deployer as supporter
        // so we don't have to do additional transfer to the address
        const supporter = signers[0];
        const amount = utils.parseUnits("100", 18);
        const initialSupporterBalance = await token.balanceOf(supporter.address)

        await approveAndSupportWithERC20(fibril, token, supporter, creator.address, amount);

        const creatorBalance = await fibril.getCreatorBalance(creator.address, token.address)
        expect(creatorBalance, `creator balance should be ${amount}`).to.equal(amount)

        const expectedSupporterBalance = initialSupporterBalance.sub(amount)
        const finalSupporterBalance = await token.balanceOf(supporter.address)
        expect(finalSupporterBalance, `supporter balance should be ${expectedSupporterBalance}`).to.equal(expectedSupporterBalance)
    })

    it('Support Creator with NFT', async () => {
        const creator = signers[0];
        const supporter = signers[1];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        const initialOwner = await nftContract.ownerOf(MOCK_TOKEN_ID)
        expect(initialOwner).to.equal(supporter.address)

        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);

        const newOwner = await nftContract.ownerOf(MOCK_TOKEN_ID)
        expect(newOwner).to.equal(fibril.address)
    })

    it('Withdraw ERC20 Token by Creator', async () => {
        const creator = signers[1];
        const supporter = signers[0];
        const supportAmount = utils.parseUnits("100", 18);
        const withdrawAmount = utils.parseUnits("50", 18);

        await approveAndSupportWithERC20(fibril, token, supporter, creator.address, supportAmount);

        // Initial withdrawal
        await withdrawERC20(fibril, token.address, creator, creator.address, withdrawAmount)

        let creatorBalance = await fibril.getCreatorBalance(creator.address, token.address)
        let expectedBalance = supportAmount.sub(withdrawAmount)
        expect(creatorBalance, `creator address balance should be `).to.equal(expectedBalance)

        // Final withdrawal
        await withdrawERC20(fibril, token.address, creator, creator.address, withdrawAmount)

        creatorBalance = await fibril.getCreatorBalance(creator.address, token.address)
        expectedBalance = expectedBalance.sub(withdrawAmount)
        expect(creatorBalance, `creator address balance should be ${expectedBalance}`).to.equal(expectedBalance)
    })

    it('Withdraw ETH by Creator', async () => {
        const creator = signers[0];
        const supporter = signers[1];
        const supportAmount = utils.parseEther("1");
        const withdrawAmount = utils.parseEther("0.5");

        // Initial withdrawal
        await supportWithETH(fibril, supporter, creator.address, supportAmount);

        await withdrawETH(fibril, creator, creator.address, withdrawAmount);

        let creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expectedBalance = supportAmount.sub(withdrawAmount)
        expect(creatorBalance, `creator balance should be ${expectedBalance}`).to.equal(expectedBalance)

        // Final withdrawal
        await withdrawETH(fibril, creator, creator.address, withdrawAmount);

        creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expectedBalance = expectedBalance.sub(withdrawAmount)
        expect(creatorBalance, `creator balance should be ${expectedBalance}`).to.equal(expectedBalance)
    })

    it('Withdraw NFT by creator', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const to = signers[2];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);
        await withdrawNFT(fibril, nftContract.address, creator, to.address, MOCK_TOKEN_ID)

        const nftOwner = await nftContract.ownerOf(MOCK_TOKEN_ID)
        expect(nftOwner).to.equal(to.address)
    })

    it('Creator list NFT', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const price = utils.parseEther("0.02")

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);
        await listCreatorNFT(fibril, nftContract.address, creator, MOCK_TOKEN_ID, price, NULL_ADDRESS)

        const listing = await nftUtil.getListing(nftContract.address, creator.address, MOCK_TOKEN_ID)
        expect(listing.pricePerItem).to.equal(price)
        expect(listing.listedBy).to.equal(creator.address)
        expect(listing.nftAddress).to.equal(nftContract.address)
        expect(listing.paymentToken).to.equal(NULL_ADDRESS)
    })

    it('Close Creator NFT listing', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const price = utils.parseEther("0.02")

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);
        await listCreatorNFT(fibril, nftContract.address, creator, MOCK_TOKEN_ID, price, NULL_ADDRESS)

        await closeNFTListing(fibril, nftContract.address, creator, MOCK_TOKEN_ID)

        const listing = await nftUtil.getListing(nftContract.address, creator.address, MOCK_TOKEN_ID)
        expect(listing.listedBy).to.equal(ZERO_ADDRESS)
        expect(listing.nftAddress).to.equal(ZERO_ADDRESS)
        expect(listing.paymentToken).to.be.equal(ZERO_ADDRESS)
    })

    it('Buy creator NFT listing', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const buyer = signers[2];
        const price = utils.parseEther("0.02")

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);
        await listCreatorNFT(fibril, nftContract.address, creator, MOCK_TOKEN_ID, price, NULL_ADDRESS)

        await buyNFTWithETH(fibril, nftContract.address, buyer, creator.address, MOCK_TOKEN_ID, price)

        const newNFTOwner2 = await nftContract.ownerOf(MOCK_TOKEN_ID)
        expect(newNFTOwner2).to.equal(buyer.address)
    })

    it('Random supporter reward', async () => {
        const [creator, ...supporters] = signers;

        const winnersCount = 2;
        const supportersCount = 4;
        const supportAmount = utils.parseEther("1");
        const rewardAmount = utils.parseEther("0.05");

        for (let i = 0; i < supportersCount; i++) {
            await supportWithETH(fibril, supporters[i], creator.address, supportAmount);
        }

        let creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        let expectedBalance = supportAmount.mul(supportersCount)
        expect(creatorBalance, `creator balance should be ${expectedBalance}`).to.equal(expectedBalance)

        await rewardRandomSupportersWithETH(fibril, vrfContract, rwgContract.address, creator, winnersCount, rewardAmount)

        creatorBalance = await fibril.getCreatorBalance(creator.address, NULL_ADDRESS)
        expectedBalance = expectedBalance.sub(rewardAmount.mul(winnersCount))
        expect(creatorBalance, `creator balance should be ${expectedBalance}`).to.equal(expectedBalance)
    })

    // Testing reverts

    it('Revert: Withdraw from non-existent Creator', async () => {
        const creator = signers[0];
        const withdrawAmount = utils.parseEther("2");

        const withdraw = withdrawETH(fibril, creator, creator.address, withdrawAmount);
        await expect(withdraw).to.be.revertedWith("Fibril: Creator does not exist");
    })

    it('Revert: Support with zero address token', async () => {
        const creator = signers[1];
        const supporter = signers[0];
        const supportAmount = utils.parseUnits("100", 18);

        const support = approveAndSupportWithERC20(fibril, ZERO_ADDRESS, supporter, creator.address, supportAmount);
        await expect(support).to.be.revertedWith("Fibril: Token address cannot be the zero address");
    })

    it('Revert: Support with zero amount', async () => {
        const creator = signers[1];
        const supporter = signers[0];
        const supportAmount = utils.parseUnits("0", 18);

        const support = approveAndSupportWithERC20(fibril, token, supporter, creator.address, supportAmount);
        await expect(support).to.be.revertedWith("Fibril: Amount cannot be zero or less");
    })

    it('Revert: Withdraw more thaen ERC20 token balance by Creator', async () => {
        const creator = signers[1];
        const supporter = signers[0];
        const supportAmount = utils.parseUnits("100", 18);
        const withdrawAmount = utils.parseUnits("200", 18);

        await approveAndSupportWithERC20(fibril, token, supporter, creator.address, supportAmount);

        const withdraw = withdrawERC20(fibril, token.address, creator, creator.address, withdrawAmount)
        await expect(withdraw).to.be.revertedWith("Fibril: Insufficient balance");
    })

    it('Revert: Withdraw more than ETH balance by Creator', async () => {
        const creator = signers[0];
        const supporter = signers[1];
        const supportAmount = utils.parseEther("1");
        const withdrawAmount = utils.parseEther("2");

        await supportWithETH(fibril, supporter, creator.address, supportAmount);

        const withdraw = withdrawETH(fibril, creator, creator.address, withdrawAmount);
        await expect(withdraw).to.be.revertedWith("Fibril: Insufficient balance");
    })

    it('Revert: Withdraw NFT not available to creator', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const to = signers[2];

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);

        // pass in a different token ID
        const withdraw = withdrawNFT(fibril, nftContract.address, creator, to.address, "2")
        await expect(withdraw).to.be.revertedWith("Fibril: NFT not available");
    })

    it('Revert: List invalid NFT item', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const price = utils.parseEther("0.02")

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);

        const listNft = listCreatorNFT(fibril, nftContract.address, creator, "2", price, NULL_ADDRESS)
        await expect(listNft).to.be.revertedWith("Invalid NFT Item");
    })

    it('Revert: List invalid NFT with zero address', async () => {
        const supporter = signers[0];
        const creator = signers[1];
        const price = utils.parseEther("0.02")

        await nftUtil.mintToken(supporter.address, MOCK_NFT_URI)
        await approveAndSupportWithNFT(fibril, nftContract, supporter, creator.address, MOCK_TOKEN_ID);

        const listNft = listCreatorNFT(fibril, ZERO_ADDRESS, creator, MOCK_TOKEN_ID, price, NULL_ADDRESS)
        await expect(listNft).to.be.revertedWith("Fibril: NFT address cannot be the zero address");
    })
});