<template>
  <div>
    <div class="mb-3 d-flex justify-space-between">
      <h5 class="text-overline">Overview</h5>
      <v-btn depressed elevation="0" class="primary" link to="/withdraw">Withdraw</v-btn>
    </div>

    <v-row>
      <Loader v-if="dashboard.loading" />
      <v-col v-else md="3" cols="12" v-for="(balance, i) in dashboard.balances" :key="'balance::' + i">
        <Balance :balance="balance" />
      </v-col>
    </v-row>

    <v-row>
      <v-col md="6">
        <div class="mb-0 d-flex justify-space-between">
          <h5 class="text-overline">Recent Activities</h5>
          <v-btn depressed elevation="0" text class="primary--text">see all</v-btn>
        </div>

        <Loader v-if="dashboard.loading" />
        <Activities v-else :activities="dashboard.activities" />
      </v-col>

      <v-col md="6">
        <div class="mb-0 d-flex justify-space-between">
          <h5 class="mb-3 text-overline">Your Crates</h5>
          <v-btn depressed elevation="0" text class="primary--text">see all</v-btn>
        </div>

        <Crates :crates="crates" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Balance from "@/components/cards/Balance"
import Activities from "@/components/lists/Activities"
import Crates from "@/components/lists/Crates"
import { useToast } from "vue-toastification/composition"
import { useDashboard } from "@/stores/dashboard"

export default defineComponent({
  components: { Balance, Activities, Crates, Loader },

  setup() {
    const dashboard = useDashboard()
    const toast = useToast()

    const crates = [
      { name: "Vue.js Crate", target: "300", currency: "USDC", from: "0x86eb…12eb" },
      { name: "Net Album Support Crate", target: "140", currency: "DAI", from: "0x86eb…12eb" },
      { name: "Regular pod crate", target: "495", currency: "USDT", from: "0x86eb…12eb" },
      { name: "Devise means", target: "76", currency: "USDT", from: "0x86eb…12eb" },
      { name: "Fibril Web3 Support Create", target: "30", currency: "DAI", from: "0x86eb…12eb" },
    ]

    onMounted(async () => {
      try {
        await dashboard.loadDashboard()
      } catch (e) {
        console.log(e)
        toast.error(e.message)
      }
    })

    return { dashboard, crates }
  },
})
</script>
