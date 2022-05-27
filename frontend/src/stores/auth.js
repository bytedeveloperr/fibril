import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { moralis } from "../helpers/moralis"

export const useAuthStore = defineStore("auth", {
  state: () => useLocalStorage("auth", { address: null, provider: null, authenticated: null, chainId: null }),

  actions: {
    async authenticate(provider, options) {
      const auth = await moralis.authenticate(provider, options)
      this.address = auth.get("ethAddress")
      this.authenticated = true
      this.provider = provider
      this.chainId = moralis.getChainId()
    },

    destroy() {
      this.address = null
      this.authenticated = null
      this.provider = null
      this.chainId = null
    },

    updateChainId() {
      this.chainId = moralis.getChainId()
    },

    async logOut() {
      await moralis.logOut()
      this.address = null
      this.authenticated = false
      this.chainId = null
    },
  },
})
