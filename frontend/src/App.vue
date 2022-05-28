<template>
  <v-app>
    <template v-if="$route.name == 'Home'">
      <v-main>
        <router-view />
      </v-main>
    </template>

    <template v-else>
      <template v-if="!partialRoutes.includes($route.name)">
        <Navigation />
      </template>

      <v-main>
        <v-container :fill-height="partialRoutes.includes($route.name)">
          <router-view />
        </v-container>

        <WrongNetwork />
      </v-main>
    </template>
  </v-app>
</template>

<script>
import Navigation from "@/components/Navigation"
import WrongNetwork from "@/components/modals/WrongNetwork"
import { defineComponent, watch } from "@vue/composition-api"
import { provideToast } from "vue-toastification/composition"
import { useAuthStore } from "@/stores/auth"

export default defineComponent({
  name: "App",
  components: { Navigation, WrongNetwork },

  setup(_, ctx) {
    provideToast({ timeout: 3000 })

    const authStore = useAuthStore()
    const partialRoutes = ["Connect", "ShowSupportLink"]

    watch(
      () => authStore.address,
      () => ctx.root.$router.push("/dashboard")
    )

    return { partialRoutes }
  },
})
</script>
