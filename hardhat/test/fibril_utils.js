const NULL_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

async function approveAndSupportWithERC20(fibril, token, supporter, creator, amount) {
    if (typeof token !== "string") {
        await token
            .connect(supporter)
            .approve(fibril.address, amount);
    }

    await fibril
        .connect(supporter)
        .support(creator, typeof token == "string" ? token : token.address, amount)
}

async function supportWithETH(fibril, supporter, creator, amount) {
    await fibril
        .connect(supporter)
        .supportWithETH(creator, { value: amount });
}

async function approveAndSupportWithNFT(fibril, nftContract, supporter, creator, tokenId) {
    await nftContract
        .connect(supporter)
        .approve(fibril.address, tokenId);

    await fibril
        .connect(supporter)
        .supportWithNFT(creator, nftContract.address, tokenId)
}

async function withdrawETH(fibril, creator, to, amount) {
    await fibril.connect(creator)
        .withdraw(NULL_ADDRESS, to, amount)
}

async function withdrawERC20(fibril, token, creator, to, amount) {
    await fibril.connect(creator)
        .withdraw(token, to, amount)
}

async function withdrawNFT(fibril, nftAddress, creator, to, tokenId) {
    await fibril
        .connect(creator)
        .withdrawNFT(to, nftAddress, tokenId)
}

async function listCreatorNFT(fibril, nftAddress, creator, tokenId, price, paymentToken) {
    await fibril
        .connect(creator)
        .listNft(nftAddress, tokenId, paymentToken, price)

}

async function closeNFTListing(fibril, nftAddress, creator, tokenId) {
    await fibril.connect(creator).closeNftListing(nftAddress, tokenId)
}

async function buyNFTWithETH(fibril, nftAddress, buyer, creator, tokenId, price) {
    await fibril
        .connect(buyer)
        .buyItem(creator, nftAddress, tokenId, NULL_ADDRESS, price, { value: price })
}

async function rewardRandomSupportersWithETH(fibril, vrfContract, rwgAddress, creator, winnersCount, rewardAmount) {
    await fibril.connect(creator)
        .rewardRandomSupporters(winnersCount, NULL_ADDRESS, rewardAmount)
    const requestId = await fibril.getRewardRequestIds(creator.address);
    await vrfContract.fulfillRandomWords(requestId, rwgAddress);
}

module.exports = {
    approveAndSupportWithERC20,
    supportWithETH,
    approveAndSupportWithNFT,
    withdrawETH,
    withdrawERC20,
    withdrawNFT,
    listCreatorNFT,
    closeNFTListing,
    buyNFTWithETH,
    rewardRandomSupportersWithETH
}