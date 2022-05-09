import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { moralis } from "../helpers/moralis"

export const useAuth = defineStore("auth", {
  state: () => useLocalStorage("auth", { address: null, provider: null, authenticated: null }),

  actions: {
    async authenticate(provider, options) {
      const auth = await moralis.authenticate(provider, options)
      this.address = auth.get("ethAddress")
      this.authenticated = true
      this.provider = provider
    },

    async destroy() {
      this.address = null
      this.authenticated = null
      this.provider = null
    },

    async logOut() {
      await moralis.logOut()
      this.address = null
      this.authenticated = false
    },
  },
})
