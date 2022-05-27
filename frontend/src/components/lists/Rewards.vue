<template>
  <div>
    <Empty v-if="rewards.length < 1" text="No rewards yet" />

    <template v-else>
      <v-simple-table fixed-header>
        <template v-slot:default>
          <thead class="mb-3">
            <tr>
              <th class="text-overline">Amount</th>
              <th class="text-overline">Number Possible Winners</th>
              <th class="text-overline">Status</th>
              <th class="text-overline"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(reward, i) in rewards" :key="'reward-' + i">
              <td>{{ reward.amountPerWinner }} {{ reward.token && reward.token.symbol }}</td>
              <td>{{ reward.winnersCount }}</td>
              <td>{{ reward.status }}</td>
              <td>
                <v-btn link text class="primary--text" @click="toggleModal(reward)">view</v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </template>

    <Reward :reward="reward" />
  </div>
</template>

<style scoped>
th {
  font-size: 15px !important;
}
</style>

<script>
import { defineComponent, provide, reactive, ref } from "@vue/composition-api"
import { environment } from "@/config/environment"
import { util } from "@/helpers/util"
import Empty from "@/components/Empty"
import Reward from "@/components/modals/Reward"

export default defineComponent({
  props: ["rewards"],
  components: { Empty, Reward },

  setup() {
    const reward = reactive({})
    const showModal = ref(null)

    function toggleModal(data) {
      Object.assign(reward, data)
      showModal.value = !showModal.value
    }

    provide("showModal", showModal)
    provide("toggleModal", toggleModal)

    return { environment, util, toggleModal, reward }
  },
})
</script>
