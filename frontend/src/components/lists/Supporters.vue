<template>
  <div>
    <Empty v-if="supporters.length < 1" text="No supporters yet" />

    <template v-else>
      <v-simple-table fixed-header>
        <template v-slot:default>
          <thead class="mb-3">
            <tr>
              <th class="text-overline">Address</th>
              <th class="text-overline">Total Support Amount (USD)</th>
              <th class="text-overline"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(supporter, i) in supporters" :key="'supporter-' + i">
              <td>
                <v-btn
                  link
                  text
                  target="_blank"
                  :href="`${environment.explorerUrl}/address/${supporter.address}`"
                  class="primary--text"
                >
                  {{ util.truncateEthAddress(supporter.address) }}
                </v-btn>
              </td>
              <td>$ {{ supporter.supports.map((s) => s.amountUsd).reduce((s, a) => Number(s) + Number(a), 0) }}</td>
              <td><v-btn link text class="primary--text" :to="`/supporter/${supporter.id}`">view</v-btn></td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </template>
  </div>
</template>

<style scoped>
th {
  font-size: 15px !important;
}
</style>

<script>
import { defineComponent } from "@vue/composition-api"
import { environment } from "@/config/environment"
import { util } from "@/helpers/util"
import Empty from "@/components/Empty"

export default defineComponent({
  props: ["supporters"],
  components: { Empty },

  setup() {
    return { environment, util }
  },
})
</script>
