<template>
  <div>
    <div class="mb-3 d-flex justify-space-between">
      <h5 class="text-overline">Overview</h5>
      <v-btn depressed class="primary" link to="/withdraw">Withdraw</v-btn>
    </div>

    <v-row>
      <Loader v-if="dashboardStore.loading" />
      <v-col v-else md="3" cols="12" v-for="(balance, i) in dashboardStore.balances" :key="'balance::' + i">
        <Balance :balance="balance" />
      </v-col>
    </v-row>

    <v-row>
      <v-col md="6" cols="12">
        <v-card flat outlined style="height: 430px">
          <v-card-text>
            <div class="mb-0 d-flex justify-space-between">
              <h5 class="text-overline">Recent Activities</h5>
              <v-btn depressed text class="primary--text" to="/activities">see all</v-btn>
            </div>

            <Loader v-if="dashboardStore.loading" />
            <Activities v-else :activities="dashboardStore.activities" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col md="6" cols="12">
        <v-card flat outlined style="height: 430px">
          <v-card-text>
            <h5 class="text-overline">Balance composition (USD)</h5>

            <Loader v-if="dashboardStore.loading" />
            <div class="d-block mx-auto" v-else>
              <canvas id="chart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card flat outlined class="mt-3">
      <v-card-text>
        <div class="mb-0 d-flex justify-space-between">
          <h5 class="text-overline">Your Supporters</h5>
          <v-btn depressed text class="primary--text" to="/supporters">see all</v-btn>
        </div>

        <Loader v-if="dashboardStore.loading" />
        <Supporters :supporters="dashboardStore.supporters" v-else />
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Balance from "@/components/cards/Balance"
import Activities from "@/components/lists/Activities"
import Supporters from "@/components/lists/Supporters"
import { useToast } from "vue-toastification/composition"
import { useDashboardStore } from "@/stores/dashboard"
import Chart from "chart.js/auto"

export default defineComponent({
  components: { Balance, Activities, Supporters, Loader },

  setup() {
    const dashboardStore = useDashboardStore()
    const toast = useToast()

    onMounted(async () => {
      try {
        await dashboardStore.loadDashboard()

        const config = {
          type: "doughnut",
          responsive: true,
          options: {
            plugins: {
              legend: {
                position: "bottom",
              },
            },
          },
          data: {
            labels: dashboardStore.balances.map((b) => b.name),
            datasets: [
              {
                label: "Balances Overview",
                data: dashboardStore.balances.map((b) => b.amountUsd),
                backgroundColor: ["rgb(130, 71, 229)", "rgb(254, 190, 68)", "rgb(80,175,149)", "rgb(39, 117, 202)"],
                hoverOffset: 4,
              },
            ],
          },
        }

        const ctx = document.querySelector("#chart")
        const chart = new Chart(ctx, {
          ...config,
          plugins: [{}],
        })

        chart.canvas.parentNode.style.height = "350px"
        chart.canvas.parentNode.style.width = "350px"
      } catch (e) {
        console.log(e)
        toast.error(e.message)
      }
    })

    return { dashboardStore }
  },
})
</script>
