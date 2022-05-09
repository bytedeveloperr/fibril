<template>
  <v-list two-line class="pt-0">
    <template v-for="(crate, i) in crates">
      <v-list-item :key="'crate' + i" link>
        <v-list-item-avatar tile rounded="10" color="grey lighten-4">
          <v-img src="https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80" />
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title class="mb-2">{{ crate.name }}</v-list-item-title>
          <v-list-item-subtitle>Target: {{ crate.target }} {{ crate.currency }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider :key="'divider-' + i" />
    </template>
  </v-list>
</template>

<script>
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: ["crates"],
})
</script>
