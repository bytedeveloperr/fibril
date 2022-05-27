<template>
  <v-list two-line class="pt-0">
    <template v-for="(balance, i) in balances">
      <v-list-item :key="'balance' + i">
        <v-list-item-avatar>
          <v-img :src="balance.logo" :alt="balance.name" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="mb-2">{{ balance.name }}</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-list-item-title class="mb-2">{{ balance.amount }} {{ balance.symbol }}</v-list-item-title>
        </v-list-item-action>
      </v-list-item>
      <v-divider :key="'divider-' + i" />
    </template>
  </v-list>
</template>

<script>
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: ["balances"],
})
</script>
