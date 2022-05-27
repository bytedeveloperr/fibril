<template>
  <div class="mx-auto d-block py-5 text-center">
    <p class="text--secondary">{{ text || "Empty. Please try again" }}</p>
  </div>
</template>

<script>
import { defineComponent } from "@vue/composition-api"

export default defineComponent({
  props: ["text"],
})
</script>
