<template>
  <div>
    <Loader v-if="user.loading" />
    <v-row v-else class="mt-3">
      <v-col md="8" cols="12" class="mx-auto pt-0">
        <div>
          <div class="d-flex justify-space-between">
            <div>
              <v-avatar tile class="mx-auto" size="100">
                <v-img :src="user.data.avatar || '/assets/images/default.jpg'" />
              </v-avatar>
              <p class="big font-weight-bold mb-0 mt-3">{{ user.data.name }}</p>
            </div>

            <v-btn depressed link class="primary--text primary lighten-5" :to="`/creator/${user.data.address}/support`"><v-icon>mdi-leaf</v-icon> Support</v-btn>
          </div>
          <p class="text--secondary small-text mt-0">{{ user.data.shortDescription }}</p>
        </div>

        <div>
          <v-tabs v-model="tab" class="mb-3">
            <v-tab class="font-weight-bold">Assets</v-tab>
            <v-tab class="font-weight-bold">NFTs</v-tab>
            <v-tab class="font-weight-bold">Crates</v-tab>
            <v-tab class="font-weight-bold">About</v-tab>
          </v-tabs>
        </div>

        <template v-if="tab == 0">
          <BalancesList :balances="dashboard.balances" />
        </template>
        <template v-if="tab == 1">
          <v-row>
            <v-col v-for="(item, i) in crates" :key="'nft-' + i" md="4">
              <NftCard :item="item" />
            </v-col>
          </v-row>
        </template>
        <template v-if="tab == 2">
          <CratesList :crates="crates" />
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.big {
  font-size: 20px;
}
.small-text {
  font-size: 15px;
}
</style>

<script>
import { defineComponent, onMounted, ref } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Balance from "@/components/cards/Balance"
import Activities from "@/components/lists/Activities"
import CratesList from "@/components/lists/Crates"
import BalancesList from "@/components/lists/Balances"
import NftCard from "@/components/cards/Nft"
import { router } from "@/router"
import { useUser } from "@/stores/user"
import { useDashboard } from "@/stores/dashboard"

export default defineComponent({
  components: { Balance, Activities, CratesList, NftCard, BalancesList, Loader },

  setup() {
    const tab = ref(null)
    const user = useUser()
    const dashboard = useDashboard()

    const crates = [
      { name: "Vue.js Crate", target: "300", currency: "USDC", from: "0x86eb…12eb" },
      { name: "Net Album Support Crate", target: "140", currency: "DAI", from: "0x86eb…12eb" },
      { name: "Regular pod crate", target: "495", currency: "USDT", from: "0x86eb…12eb" },
      { name: "Devise means", target: "76", currency: "USDT", from: "0x86eb…12eb" },
      { name: "Fibril Web3 Support Create", target: "30", currency: "DAI", from: "0x86eb…12eb" },
    ]

    onMounted(async () => {
      await user.getUser(router.currentRoute.params.id)
      await dashboard.loadBalances(router.currentRoute.params.id)
    })

    return { dashboard, crates, tab, user }
  },
})
</script>
