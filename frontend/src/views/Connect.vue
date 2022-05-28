<template>
  <v-row class="mt-10">
    <v-col md="6" class="mx-auto">
      <h2 class="mb-3">Connect your walet</h2>

      <p>Hi Fren 👋. Choose a wallet provider below to connect to Fibril</p>

      <v-list>
        <template v-for="(provider, i) in providers">
          <v-list-item class="mb-3" :key="i" link @click="authenticate(provider.title.toLowerCase())">
            <v-list-item-avatar>
              <v-img :src="provider.image"></v-img>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title v-html="provider.title"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent } from "@vue/composition-api"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  setup(_, ctx) {
    const { $router, $route } = ctx.root
    const toast = useToast()
    const authStore = useAuthStore()

    const providers = [
      { title: "Metamask", image: "/assets/images/metamask.svg" },
      { title: "WalletConnect", image: "/assets/images/walletconnect.svg" },
    ]

    async function authenticate(provider) {
      try {
        await authStore.authenticate(provider)
        $router.push($route.query.next || "/dashboard")
      } catch (e) {
        toast.error(e.message)
      }
    }

    return { providers, authenticate }
  },
})
</script>

<style scoped>
.v-list-item {
  border: 1px solid rgb(223, 223, 223);
}
</style>
