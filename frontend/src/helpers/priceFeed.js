import { environment } from "../config/environment"
import { priceFeedABI } from "../abis/priceFeed"
import { moralis } from "./moralis"

export const priceFeed = {
  async getLatestPrice(token) {
    const price = await moralis.runContractFunction({
      address: environment.priceFeedContractAddress,
      abi: priceFeedABI,
      function_name: "getLatestPrice",
      params: {
        _token: token,
      },
    })

    return Number(price.value) / Math.pow(10, price.decimals)
  },
}
