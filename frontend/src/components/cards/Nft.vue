<template>
  <v-card flat outlined height="400">
    <router-link :to="`/nft/${item.address}:${item.tokenId}`">
      <v-img :src="(item.metadata && item.metadata.image) || '/assets/images/not-found.png'" height="300" />
    </router-link>

    <v-card-text class="pb-0">
      <router-link :to="`/nft/${item.address}:${item.tokenId}`">
        <div class="d-flex justify-space-between">
          <p class="h4 mb-3 font-weight-bold">{{ item.metadata && item.metadata.name }}</p>
          <p class="text-small">{{ item.price }} USDC</p>
        </div>
      </router-link>

      <div class="d-flex justify-space-between">
        <v-btn text link outlined shaped class="primary--text" v-if="item.isListed">Buy</v-btn>
        <v-btn text link outlined shaped disabled class="primary--text disabled" v-else>Not for sale</v-btn>

        <v-btn icon shaped link><v-icon>mdi-heart-outline</v-icon></v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: ["item"],
})
</script>

<style scoped>
.h4 {
  font-size: 16px;
}

a {
  color: inherit !important;
  text-decoration: none !important;
}
</style>
