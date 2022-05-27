import { defineStore } from "pinia"
import { fibril } from "../helpers/fibril"
import { useAuthStore } from "./auth"

export const useNftStore = defineStore("nfts", {
  state: () => ({
    nft: {},
    nfts: [],
    loading: false,
  }),

  getters: {
    getNftListings() {
      return async (address, id) => await fibril.getNftListings(address, id)
    },
  },

  actions: {
    async loadNfts(address) {
      this.loading = true

      const nfts = await fibril.getNfts(address)
      this.nfts = [...nfts]

      this.loading = false
    },

    async loadNftItem(address, id, options = {}) {
      this.loading = true

      let nft = options.nft
      if (!nft) {
        nft = await fibril.getNftItem(address, id)
      }

      console.log(address, id)
      this.nft = { ...nft }

      this.loading = false
    },

    async closeNftListing(data) {
      await fibril.closeNftListing(data)
      await this.loadNftItem(data.address, data.tokenId)
    },

    async buyNftItem(data) {
      data.buyer = useAuthStore().address

      await fibril.buyNftItem(data)
      await this.loadNftItem(data.address, data.tokenId)
    },

    async listNft(data) {
      await fibril.listNft(data)
      await this.loadNftItem(data.address, data.tokenId)
    },
  },
})
