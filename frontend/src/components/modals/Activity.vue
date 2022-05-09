<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex justify-space-between">
          <h3 class="my-3">Activity</h3>
          <v-btn icon @click="toggleModal"><v-icon>mdi-close-circle-outline</v-icon></v-btn>
        </div>

        <ul class="style-none pa-0">
          <li class="d-flex justify-space-between">
            <b>Transaction ID:</b>
            <v-btn text link class="primary--text">{{ util.truncateEthAddress(activity.id) }}</v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between mb-3">
            <b>Type:</b>
            <span class="pe-5">{{ activity.type }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between">
            <b>From:</b>
            <v-btn text link class="primary--text">{{ util.truncateEthAddress(activity.from) }}</v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between">
            <b>To:</b>
            <v-btn text link class="primary--text">{{ util.truncateEthAddress(activity.to) }}</v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <b>Amount:</b>
            <span class="pe-5">{{ activity.value }} {{ activity.asset && activity.asset.symbol }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <b>Date:</b>
            <span>{{ new Date(Number(activity.timestamp) * 100) }}</span>
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject } from "@vue/composition-api"
import { util } from "@/helpers/util"

export default defineComponent({
  props: ["activity"],
  setup() {
    const show = inject("showModal")
    const toggleModal = inject("toggleModal")

    return { show, util, toggleModal }
  },
})
</script>

<style scoped>
.style-none {
  list-style: none;
}
</style>
