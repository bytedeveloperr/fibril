<template>
  <div class="ma-2">
    <v-snackbar v-model="show" :class="color">{{ text }} </v-snackbar>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: ["color", "text", "show"],
})
</script>
