import { defineStore } from "pinia"
import { fibril } from "../helpers/fibril"
import { useAuthStore } from "./auth"

export const useRewardStore = defineStore("rewards", {
  state: () => ({
    reward: {},
    rewards: [],
    loading: false,
  }),

  actions: {
    async loadRewards() {
      this.loading = true

      const rewards = await fibril.getCreatorRewards(useAuthStore().address)
      this.rewards = [...rewards]

      this.loading = false
    },

    async loadRewardItem(address, id, options = {}) {
      this.loading = true

      let reward = options.reward
      if (!reward) {
        reward = await fibril.getRewardItem(address, id)
      }

      console.log(address, id)
      this.reward = { ...reward }

      this.loading = false
    },

    async rewardRandomSupporters(data) {
      await fibril.rewardRandomSupporters(data)
    },
  },
})
