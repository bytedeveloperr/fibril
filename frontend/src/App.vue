<template>
  <v-app>
    <Navigation v-if="!partialRoutes.includes($route.path)" />

    <v-main>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Navigation from "@/components/Navigation"
import { defineComponent } from "@vue/composition-api"
import { provideToast } from "vue-toastification/composition"

export default defineComponent({
  name: "App",
  components: { Navigation },
  setup() {
    const partialRoutes = ["/connect"]
    provideToast({ timeout: 3000 })

    return { partialRoutes }
  },
})
</script>
