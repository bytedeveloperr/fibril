<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex justify-space-between mb-3">
          <p class="h3 mt-1">Activity</p>
          <v-btn icon @click="toggleModal"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <ul class="style-none pa-0">
          <li class="d-flex justify-space-between">
            <span>Transaction ID:</span>
            <v-btn
              text
              link
              target="_blank"
              :href="`${environment.explorerUrl}/tx/${activity.id}`"
              class="primary--text"
            >
              {{ util.truncateEthAddress(activity.id) }}
            </v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between mb-3">
            <span>Type:</span>
            <span class="pe-5">{{ activity.type }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between">
            <span>From:</span>
            <v-btn
              text
              link
              target="_blank"
              :href="`${environment.explorerUrl}/address/${activity.from}`"
              class="primary--text"
            >
              {{ util.truncateEthAddress(activity.from) }}
            </v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between">
            <span>To:</span>
            <v-btn
              text
              link
              target="_blank"
              :href="`${environment.explorerUrl}/address/${activity.to}`"
              class="primary--text"
            >
              {{ util.truncateEthAddress(activity.to) }}
            </v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Amount:</span>
            <span class="pe-5">{{ activity.value }} {{ activity.asset && activity.asset.symbol }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Date:</span>
            <span>{{ util.formatDate(Number(activity.timestamp) * 1000) }}</span>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { environment } from "@/config/environment"

export default defineComponent({
  props: ["activity"],
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
