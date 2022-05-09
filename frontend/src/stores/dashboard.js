import { defineStore } from "pinia"
import { fibril } from "../helpers/fibril"
import { util } from "../helpers/util"
import { useAuth } from "./auth"

export const useDashboard = defineStore("dashboard", {
  state: () => ({ loading: false, auth: {}, balances: [], activities: [] }),

  actions: {
    async loadDashboard(address) {
      this.loading = true
      if (!address) {
        this.auth = useAuth()
        address = this.auth.address
      }

      if (!util.isEthAddress(address)) {
        throw new Error("Invalid Ethereum address")
      }

      const data = await fibril.getCreatorDashboardData(address)
      this.activities = data.activities
      this.balances = data.balances
      this.loading = false
    },

    async loadBalances(address) {
      if (!address) {
        this.auth = useAuth()
        address = this.auth.address
      }

      if (!util.isEthAddress(address)) {
        throw new Error("Invalid Ethereum address")
      }

      this.balances = await fibril.getCreatorBalances(address)
    },

    async loadActivities(address) {
      if (!address) {
        this.auth = useAuth()
        address = this.auth.address
      }

      if (!util.isEthAddress(address)) {
        throw new Error("Invalid Ethereum address")
      }

      await fibril.getCreatorActivities(address)
    },

    async getNfts() {
      return await fibril.getNfts()
    },

    async getNftItem(address, id) {
      return await fibril.getNftItem(address, id)
    },
  },
})

// 0xCA5Ac6854f937a8971d47393ad246fCCdb66d24d
