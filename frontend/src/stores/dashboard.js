import { defineStore } from "pinia"
import { fibril } from "../helpers/fibril"
import { util } from "../helpers/util"
import { useAuthStore } from "./auth"

export const useDashboardStore = defineStore("dashboard", {
  state: () => ({ loading: false, balances: [], activities: [], supporters: [] }),

  actions: {
    async loadDashboard(addr) {
      this.loading = true

      const address = addr || useAuthStore().address
      if (!util.isEthAddress(address)) {
        throw new Error("Invalid Ethereum address")
      }

      const data = await fibril.getCreatorDashboardData(address)
      this.activities = data.activities
      this.balances = data.balances
      this.supporters = data.supporters

      this.loading = false
    },

    async loadBalances(addr) {
      const address = addr || useAuthStore().address

      if (!util.isEthAddress(address)) {
        throw new Error("Invalid Ethereum address")
      }
      this.balances = await fibril.getCreatorBalances(address)
    },

    async getCreatorActivities() {
      return await fibril.getCreatorActivities(useAuthStore().address)
    },

    async getCreatorSupporters() {
      return await fibril.getCreatorSupporters(useAuthStore().address)
    },

    async getCreatorSupporter(id) {
      return await fibril.getCreatorSupporter(id)
    },
  },
})
