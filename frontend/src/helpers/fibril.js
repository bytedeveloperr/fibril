import { config } from "../config/config"
import { graph } from "./graph"
import { moralis } from "./moralis"
import { fibrilABI } from "../abis/fibril"
import { ERC20ABI } from "../abis/erc20"
import { ERC721ABI } from "../abis/erc721"
import { environment } from "../config/environment"
import { alchemy } from "./alchemy"
import { priceFeed } from "./priceFeed"
import { util } from "./util"

export const fibril = {
  async getCreatorBalances(address) {
    const result = await graph.getBalances(address)
    const output = []

    for (let i = 0; i < config.tokens.length; i++) {
      const asset = {
        name: config.tokens[i].name,
        symbol: config.tokens[i].symbol,
        address: config.tokens[i].address,
        logo: config.tokens[i].logo,
        decimals: config.tokens[i].decimals,
      }

      const balance = result.find((balance) => balance.token.toLowerCase() === asset.address.toLowerCase())
      asset.amount = balance ? balance.amount / Math.pow(10, asset.decimals) : 0

      const usdPrice = await priceFeed.getLatestPrice(asset.address)
      const amountUsd = asset.amount * usdPrice
      asset.amountUsd = (Math.round(amountUsd * 10 ** 4) / 10 ** 4).toFixed(4)

      output.push(asset)
    }

    return output
  },

  async getCreatorDashboardData(address) {
    const [balances, activities, supporters] = await Promise.all([
      this.getCreatorBalances(address),
      this.getCreatorActivities(address),
      this.getCreatorSupporters(address),
    ])

    return { balances, activities: activities.slice(0, 5), supporters: supporters.slice(0, 5) }
  },

  async getCreatorActivities(address) {
    const result = await graph.getActivities(address)
    const output = []

    for (let i = 0; i < result.length; i++) {
      const activity = { ...result[i] }
      const asset = config.tokens.find((token) => token.address.toLowerCase() == activity.token.toLowerCase())

      if (asset) {
        activity.value = asset ? activity.value / Math.pow(10, asset.decimals) : 0
        activity.asset = asset

        output.push(activity)
      }
    }

    return output.sort((a, b) => b.timestamp - a.timestamp)
  },

  async getCreatorSupporters(address) {
    const result = await graph.getSupporters(address)

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result[i].supports.length; j++) {
        const token = config.tokens.find((t) => t.address.toLowerCase() === result[i].supports[j].token)
        result[i].supports[j].token = token
        result[i].supports[j].amount = result[i].supports[j].amount / Math.pow(10, token.decimals)

        const usdPrice = await priceFeed.getLatestPrice(token.address)
        const amountUsd = result[i].supports[j].amount * usdPrice
        result[i].supports[j].amountUsd = (Math.round(amountUsd * 10 ** 4) / 10 ** 4).toFixed(4)
      }
    }

    return result
  },

  async getCreatorSupporter(id) {
    const result = await graph.getSupporter(id)
    if (!result) {
      return
    }

    for (let i = 0; i < result.supports.length; i++) {
      const token = config.tokens.find((t) => t.address.toLowerCase() === result.supports[i].token)
      result.supports[i].token = token
      result.supports[i].amount = result.supports[i].amount / Math.pow(10, token.decimals)
    }

    return result
  },

  async supportCreator(data) {
    const supportOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      params: { _creator: data.creator },
    }

    if (data.asset?.address?.toLowerCase() == environment.nullAddress.toLowerCase()) {
      supportOptions.functionName = "supportWithETH"
      supportOptions.msgValue = moralis.toUnit({ value: data.amount })
    } else {
      const allowance = await moralis.runContractFunction({
        address: data.asset?.address,
        abi: ERC20ABI,
        function_name: "allowance",
        params: {
          _owner: data.supporter,
          _spender: environment.fibrilContractAddress,
        },
      })

      if (allowance < moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset?.decimals })) {
        const approveOptions = {
          contractAddress: data.asset?.address,
          functionName: "approve",
          abi: ERC20ABI,
          params: {
            _spender: environment.fibrilContractAddress,
            _value: moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset?.decimals }),
          },
        }
        const approveTx = await moralis.executeContract(approveOptions)
        await approveTx.wait()
      }

      supportOptions.contractAddress = environment.fibrilContractAddress
      supportOptions.functionName = "support"
      supportOptions.params._amount = moralis.toUnit({
        value: data.amount,
        type: "Token",
        decimals: data.asset?.decimals,
      })
      supportOptions.params._token = data.asset?.address
    }

    const supportTx = await moralis.executeContract(supportOptions)
    await supportTx.wait()
  },

  async supportCreatorWithNft(data) {
    const supportOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      functionName: "supportWithNFT",
      params: {
        _creator: data.creator,
        _nftAddress: data.contract,
        _tokenId: data.tokenId,
      },
    }

    const nftOwner = await moralis.runContractFunction({
      address: data.contract,
      abi: ERC721ABI,
      function_name: "ownerOf",
      params: { tokenId: data.tokenId },
    })

    if (nftOwner.toLowerCase() != data.supporter.toLowerCase()) {
      throw new Error("You do not own the NFT Item")
    }

    const approved = await moralis.runContractFunction({
      address: data.contract,
      abi: ERC721ABI,
      function_name: "getApproved",
      params: { tokenId: data.tokenId },
    })

    if (approved.toLowerCase() !== environment.fibrilContractAddress.toLowerCase()) {
      const approveOptions = {
        contractAddress: data.contract,
        functionName: "approve",
        abi: ERC721ABI,
        params: {
          to: environment.fibrilContractAddress,
          tokenId: data.tokenId,
        },
      }

      const approveTx = await moralis.executeContract(approveOptions)
      await approveTx.wait()
    }

    const supportTx = await moralis.executeContract(supportOptions)
    await supportTx.wait()
  },

  async listNft(data) {
    const listOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      functionName: "listNft",
      params: {
        _nftAddress: data.address,
        _tokenId: data.tokenId,
        _paymentToken: data.asset?.address,
        _pricePerItem: moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset?.decimals }),
      },
    }

    const listTx = await moralis.executeContract(listOptions)
    await listTx.wait()
  },

  async closeNftListing(data) {
    const closeNftListingOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      functionName: "closeNftListing",
      params: {
        _nftAddress: data.address,
        _tokenId: data.tokenId,
      },
    }

    const closeTx = await moralis.executeContract(closeNftListingOptions)
    await closeTx.wait()
  },

  async buyNftItem(data) {
    if (data.paymentToken.address.toLowerCase() !== environment.nullAddress.toLowerCase()) {
      const allowance = await moralis.runContractFunction({
        address: data.paymentToken.address,
        abi: ERC20ABI,
        function_name: "allowance",
        params: {
          _owner: data.buyer,
          _spender: environment.fibrilContractAddress,
        },
      })

      if (allowance < moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset.decimals })) {
        const approveOptions = {
          contractAddress: data.paymentToken.address,
          functionName: "approve",
          abi: ERC20ABI,
          params: {
            _spender: environment.fibrilContractAddress,
            _value: moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset.decimals }),
          },
        }

        const approveTx = await moralis.executeContract(approveOptions)
        await approveTx.wait()
      }
    }

    const buyNftItemOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      functionName: "buyItem",
      msgValue: moralis.toUnit({ value: data.amount }),
      params: {
        _nftAddress: data.address,
        _tokenId: data.tokenId,
        _creator: data.creator,
        _paymentToken: data.paymentToken.address,
        _amount: moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset.decimals }),
      },
    }

    const buyTx = await moralis.executeContract(buyNftItemOptions)
    await buyTx.wait()
  },

  async withdrawToken(data) {
    const withdrawOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      params: {
        _token: data.asset?.address,
        _recipient: data.recipient,
        _amount: moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset?.decimals }),
      },
      functionName: "withdraw",
    }

    const withdrawTx = await moralis.executeContract(withdrawOptions)
    await withdrawTx.wait()
  },

  async withdrawNft(data) {
    const withdrawOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      params: {
        _nftAddress: data.nftAddress,
        _recipient: data.recipient,
        _tokenId: data.tokenId,
      },
      functionName: "withdrawNFT",
    }

    const withdrawTx = await moralis.executeContract(withdrawOptions)
    await withdrawTx.wait()
  },

  async rewardRandomSupporters(data) {
    const withdrawOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      params: {
        _winnersCount: data.winners,
        _token: data.asset?.address,
        _amountPerWinner: moralis.toUnit({ value: data.amount, type: "Token", decimals: data.asset?.decimals }),
      },
      functionName: "rewardRandomSupporters",
    }

    const withdrawTx = await moralis.executeContract(withdrawOptions)
    await withdrawTx.wait()
  },

  async getNfts(address) {
    const nfts = address ? await graph.getCreatorNfts(address) : await graph.getNfts()
    return await Promise.all(this.mapNftsMetadata(nfts))
  },

  mapNftsMetadata(nfts) {
    return nfts.map(async (nft) => {
      try {
        return await this.getNftItem(nft.address, nft.tokenId, { data: nft })
      } catch (e) {
        console.log(e)
      }
    })
  },

  async getNftItem(address, id, extra = {}) {
    try {
      const nft = extra.data || (await graph.getNftItem(address, id))
      const [data, listings] = await Promise.all([
        alchemy.getNftMetadata({ address: nft.address, tokenId: nft.tokenId, type: "ERC721" }),
        this.getNftListings(nft.address, nft.tokenId),
      ])

      data.metadata = {
        ...data.metadata,
        image: util.parseIpfsUrl(data.metadata.image),
      }

      return {
        ...nft,
        listings,
        sale: listings[listings.length - 1],
        metadata: typeof data.metadata === "string" ? eval("(" + data.metadata + ")") : data.metadata,
      }
    } catch (e) {
      console.log(e)
    }
  },

  async getNftListings(address, id) {
    try {
      const rawListings = await graph.getNftListings(address, id)
      const refinedListings = rawListings.map(async (listing) => {
        const token = config.tokens.find((t) => t.address.toLowerCase() === listing.paymentToken.toLowerCase())

        return {
          ...listing,
          paymentToken: token,
          pricePerItem: String(listing.pricePerItem / Math.pow(10, token.decimals)),
        }
      })

      return await Promise.all(refinedListings)
    } catch (e) {
      console.log(e)
    }
  },

  async getSupportLinks(address) {
    const links = await moralis.data.getSupportLinks(address)
    const map = await Promise.all(
      links.map(async (link) => await this.getSupportLink(link.attributes.cid, { data: link }))
    )

    return map.sort((a, b) => b.timestamp - a.timestamp)
  },

  async getSupportLink(cid, options = {}) {
    try {
      const link = options.data || (await moralis.data.getSupportLink(cid))
      if (!link) {
        throw new Error("Support link not found")
      }

      // const response = await fetch(`https://dweb.link/ipfs/${link.attributes.cid}/support.json`)
      // const json = await response.json()
      const token = config.tokens.find((t) => t.address.toLowerCase() === link.attributes.token.toLowerCase())
      const amount = Number(link.attributes.amount) / Math.pow(10, token.decimals)

      return { ...link.attributes, amount, token }
    } catch (e) {
      console.log(e)
    }
  },

  async getCreatorRewards(address) {
    try {
      const rawRewards = await graph.getCreatorRewards(address)
      const refinedRewards = rawRewards.map(async (reward) => {
        const token = config.tokens.find((t) => t.address.toLowerCase() === reward.token.toLowerCase())

        return {
          ...reward,
          token,
          amountPerWinner: String(reward.amountPerWinner / Math.pow(10, token.decimals)),
        }
      })

      return await Promise.all(refinedRewards)
    } catch (e) {
      console.log(e)
    }
  },
}
