<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex justify-space-between mb-3">
          <p class="h3 mt-1">Reward</p>
          <v-btn icon @click="toggleModal"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <ul class="style-none pa-0">
          <li class="d-flex justify-space-between pb-3">
            <span>Amount per winner:</span>
            <span>{{ reward.amountPerWinner }} {{ reward.token && reward.token.symbol }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Number of possible winners:</span>
            <span>{{ reward.winnersCount }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Status:</span>
            <span>{{ reward.status }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Date:</span>
            <span>{{ util.formatDate(Number(reward.timestamp) * 1000) }}</span>
          </li>
          <v-divider class="mb-3" />
        </ul>

        <h3 class="h3 font-weight-normal mt-5">Winners</h3>
        <template v-if="reward.winners && reward.winners.length > 0">
          <ul class="style-none pa-0">
            <li class="d-flex justify-space-between pb-3" v-for="winner in reward.winners" :key="winner">
              <v-btn text link :href="`${environment.explorerUrl}/address/${winner}`" class="px-0 primary--text">
                {{ winner }}
              </v-btn>
            </li>
          </ul>
        </template>
        <Empty v-else text="No winners yet" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { environment } from "@/config/environment"
import Empty from "@/components/Empty"

export default defineComponent({
  props: ["reward"],
  components: { Empty },
  setup() {
    const show = inject("showModal")
    const toggleModal = inject("toggleModal")

    return { show, util, environment, toggleModal }
  },
})
</script>

<style scoped>
.style-none {
  list-style: none;
}
.h3 {
  font-size: 18px;
}
</style>
