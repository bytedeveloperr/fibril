<template>
  <v-card flat outlined link :to="`/creator/${item.ethAddress}`">
    <v-img height="250" :src="item.avatar || '/assets/images/default.jpg'"></v-img>

    <v-card-text>
      <h5 class="h4 mb-3">{{ item.name }}</h5>
      <p class="mb-0">{{ item.shortDescription }}</p>
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
</style>
