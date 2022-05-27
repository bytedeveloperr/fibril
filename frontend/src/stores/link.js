import { defineStore } from "pinia"
import { fibril } from "../helpers/fibril"
import { moralis } from "../helpers/moralis"
import { useAuthStore } from "./auth"

export const useLinkStore = defineStore("links", {
  state: () => ({
    links: [],
    link: {},
    loading: false,
  }),

  actions: {
    async createSupportLink(data) {
      await moralis.data.createSupportLink(data)
      const link = await fibril.getSupportLink(data.cid)

      this.links = [link, ...this.$state.links]
    },

    async loadSupportLinks() {
      this.loading = true

      const authStore = useAuthStore()
      const links = await fibril.getSupportLinks(authStore.address)
      this.links = [...links]

      this.loading = false
    },

    async loadSupportLink(cid) {
      this.loading = true

      const link = await fibril.getSupportLink(cid)
      this.link = { ...link }

      this.loading = false
    },
  },
})
