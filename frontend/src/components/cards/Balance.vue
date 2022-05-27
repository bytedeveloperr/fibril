<template>
  <v-card outlined>
    <v-list-item two-line>
      <v-list-item-content>
        <div class="mb-4">{{ balance.name }}</div>
        <v-list-item-title class="mb-2 balance-text"> {{ balance.amount }} {{ balance.symbol }} </v-list-item-title>
        <!-- <v-list-item-subtitle>
          <span style="font-size: 15px">{{ `$ ${balance.amountUsd} ` }}</span>
        </v-list-item-subtitle> -->
      </v-list-item-content>

      <v-list-item-avatar size="35">
        <img :src="balance.logo" :alt="balance.symbol" />
      </v-list-item-avatar>
    </v-list-item>
  </v-card>
</template>

<script>
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: ["balance"],
  setup() {},
})
</script>

<style scoped>
.balance-text {
  font-size: 20px;
  font-weight: medium;
}
</style>
