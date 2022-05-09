import { config } from "../config/config"
import { graph } from "./graph"
import { moralis } from "./moralis"
import { fibrilABI } from "../abis/fibril"
import { ERC20ABI } from "../abis/erc20"
import { ERC721ABI } from "../abis/erc721"
import { util } from "./util"
import { environment } from "../config/environment"
import { alchemy } from "./alchemy"

export const fibril = {
  async getCreatorBalances(address) {
    const data = await moralis.getTokenMetadata(config.tokens)
    const result = await graph.getBalances(address)
    const output = []

    for (let i = 0; i < data.length; i++) {
      const asset = {
        name: data[i].name,
        symbol: data[i].symbol,
        address: data[i].address,
        logo: data[i].logo,
        decimals: data[i].decimals,
      }

      const balance = result.find((balance) => (util.isNullAddress(balance.token) ? environment.nativeTokenAddress === asset.address : balance.token === asset.address))
      asset.amount = balance ? balance.amount / Math.pow(10, asset.decimals) : 0
      if (!asset.logo) {
        asset.logo = `/assets/images/${asset.symbol.toLowerCase()}.svg`
      }

      output.push(asset)
    }

    return output
  },

  async getCreatorDashboardData(address) {
    const data = await moralis.getTokenMetadata(config.tokens)
    const result = await graph.getDashboardData(address)
    const output = { balances: [], activities: [] }

    for (let i = 0; i < data.length; i++) {
      const asset = {
        name: data[i].name,
        symbol: data[i].symbol,
        address: data[i].address,
        logo: data[i].logo,
        decimals: data[i].decimals,
      }

      const balance = result.tokenBalances.find((balance) => (util.isNullAddress(balance.token) ? environment.nativeTokenAddress === asset.address : balance.token === asset.address))
      asset.amount = balance ? balance.amount / Math.pow(10, asset.decimals) : 0
      if (!asset.logo) {
        asset.logo = `/assets/images/${asset.symbol.toLowerCase()}.svg`
      }

      output.balances.push(asset)
    }

    for (let i = 0; i < result.activities.length; i++) {
      const activity = { ...result.activities[i] }
      const asset = data.find((token) => config.token[token.symbol].toLowerCase() === (activity.token === environment.nullAddress ? environment.nativeTokenAddress : activity.token))
      if (asset) {
        if (!asset.logo) {
          asset.logo = `/assets/images/${asset.symbol.toLowerCase()}.svg`
        }
        activity.value = asset ? activity.value / Math.pow(10, asset.decimals) : 0
        activity.asset = asset

        output.activities.push(activity)
      }
    }

    return output
  },

  async getCreatorActivities(address) {
    const data = await moralis.getTokenMetadata(config.tokens)
    const result = await graph.getActivities(address)
    const output = []

    for (let i = 0; i < result.length; i++) {
      const activity = { ...result[i] }

      const asset = data.find((token) => config.token[token.symbol].toLowerCase() === (activity.token === environment.nullAddress ? environment.nativeTokenAddress : activity.token))
      if (!asset.logo) {
        asset.logo = `/assets/images/${asset.symbol.toLowerCase()}.svg`
      }
      activity.value = asset ? activity.value / Math.pow(10, asset.decimals) : 0
      activity.asset = asset

      output.push(activity)
    }

    return output
  },

  async supportCreator(data) {
    const amountInDecimals = data.amount * Math.pow(10, data.asset?.decimals)
    const supportOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      params: { _creator: data.creator },
    }

    if (data.asset?.address == environment.nativeTokenAddress) {
      supportOptions.functionName = "supportWithETH"
      supportOptions.msgValue = amountInDecimals
    } else {
      const allowance = await moralis.runContractFunction({
        address: data.asset?.address,
        abi: ERC20ABI,
        function_name: "allowance",
        params: { _owner: data.supporter, _spender: environment.fibrilContractAddress },
      })

      if (allowance < amountInDecimals) {
        const approveOptions = {
          contractAddress: data.asset?.address,
          functionName: "approve",
          abi: ERC20ABI,
          params: { _spender: environment.fibrilContractAddress, _value: String(amountInDecimals) },
        }
        await moralis.executeContract(approveOptions)
      }

      supportOptions.contractAddress = environment.fibrilContractAddress
      supportOptions.functionName = "support"
      supportOptions.params._amount = String(amountInDecimals)
      supportOptions.params._token = data.asset?.address
    }

    await moralis.executeContract(supportOptions)
  },

  async supportCreatorWithNft(data) {
    const supportOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      functionName: "supportWithNFT",
      params: { _creator: data.creator, _nftAddress: data.contract, _tokenId: data.tokenId },
    }

    const nftOwner = await moralis.runContractFunction({
      address: data.contract,
      abi: ERC721ABI,
      function_name: "ownerOf",
      params: { tokenId: data.tokenId },
    })

    console.log(nftOwner, data)
    if (nftOwner.toLowerCase() != data.supporter.toLowerCase()) {
      return alert("You do not own asset")
    }

    const approved = await moralis.runContractFunction({
      address: data.contract,
      abi: ERC721ABI,
      function_name: "getApproved",
      params: { tokenId: data.tokenId },
    })

    console.log({ approved })

    if (approved.toLowerCase() !== environment.fibrilContractAddress.toUpperCase()) {
      console.log(approveOptions)
      const approveOptions = {
        contractAddress: data.contract,
        functionName: "approve",
        abi: ERC721ABI,
        params: { to: environment.fibrilContractAddress, tokenId: data.tokenId },
      }

      await moralis.executeContract(approveOptions)
    }

    await moralis.executeContract(supportOptions)
  },

  async withdrawAsset(data) {
    const amountInDecimals = data.amount * Math.pow(10, data.asset?.decimals)
    const address = data.asset?.address.toLowerCase() === environment.nativeTokenAddress.toLocaleLowerCase() ? environment.nullAddress : data.asset?.address.toLowerCase()

    console.log(address)

    const withdrawOptions = {
      contractAddress: environment.fibrilContractAddress,
      abi: fibrilABI,
      params: { _token: address, _recipient: data.recipient, _amount: String(amountInDecimals) },
      functionName: "withdraw",
    }

    await moralis.executeContract(withdrawOptions)
  },

  async getNfts() {
    const nfts = await graph.getNfts()

    const data = nfts.map(async (nft) => {
      try {
        const data = await alchemy.getNftMetadata({ address: nft.address, tokenId: nft.tokenId, type: "ERC721" })

        return {
          ...nft,
          metadata: typeof data.metadata === "string" ? eval("(" + data.metadata + ")") : {},
        }
      } catch (e) {
        console.log(e)
      }
    })

    return await Promise.all(data)
  },

  async getNftItem(address, id) {
    try {
      const nft = await graph.getNftItem(address, id)
      const data = await alchemy.getNftMetadata({ address: nft.address, tokenId: nft.tokenId, type: "ERC721" })

      return {
        ...nft,
        metadata: typeof data.metadata === "string" ? eval("(" + data.metadata + ")") : {},
      }
    } catch (e) {
      console.log(e)
    }
  },
}
