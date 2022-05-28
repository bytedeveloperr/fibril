<template>
  <div>
    <Empty v-if="listings.length < 1" />
    <v-list v-else two-line class="pa-0">
      <template v-for="(listing, i) in listings">
        <v-list-item :key="'listing-' + i" class="pa-0">
          <v-list-item-content>
            <v-list-item-title class="mb-2">
              Listed by
              <v-btn
                text
                link
                class="primary--text"
                target="_blank"
                :href="`${environment.explorerUrl}/address/${listing.listedBy}`"
              >
                {{ util.truncateEthAddress(listing.listedBy) }}
              </v-btn>
            </v-list-item-title>
            <v-list-item-subtitle>{{ util.formatDate(listing.listedAt * 1000) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-title class="mb-2">
              {{ listing.pricePerItem }} {{ listing.paymentToken && listing.paymentToken.symbol }}
            </v-list-item-title>
          </v-list-item-action>
        </v-list-item>
        <v-divider :key="'div' + i" />
      </template>
    </v-list>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api"
import Empty from "@/components/Empty"
import { useAuthStore } from "@/stores/auth"
import { util } from "@/helpers/util"
import { environment } from "@/config/environment"

export default defineComponent({
  props: ["listings"],
  components: { Empty },
  setup() {
    const authStore = useAuthStore()

    return { authStore, util, environment }
  },
})
</script>

<style scoped>
.h3 {
  font-size: 20px;
}
</style>
