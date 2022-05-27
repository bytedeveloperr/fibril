import axios from "axios"

const apiKey = "fyabjvlxXQdRUm1hOWfQC9_hnr7aRC0h"

const request = axios.create({
  baseURL: `https://polygon-mumbai.g.alchemyapi.io/v2/${apiKey}`,
})

export const alchemy = {
  async getNftMetadata({ address, tokenId, type }) {
    const response = await request.get("/getNFTMetadata", {
      params: { contractAddress: address, tokenId, tokenType: type },
    })

    return response.data
  },
}
