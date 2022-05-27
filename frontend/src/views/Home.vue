<template>
  <section>
    <v-navigation-drawer v-model="drawer" temporary app>
      <v-list>
        <v-list-item link to="/dashboard" active-class="primary lighten-5 primary--text">
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>

          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app flat class="white">
      <v-container class="py-0 fill-height">
        <v-toolbar-title>{{ config.appName }}</v-toolbar-title>

        <v-spacer />

        <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>
        <div class="d-none d-md-block">
          <v-btn depressed link to="/dashboard" class="primary--text" v-if="authStore.authenticated">Dashboard</v-btn>
          <v-btn depressed link to="/connect" class="primary" v-else>Connect wallet</v-btn>
        </div>
      </v-container>
    </v-app-bar>

    <header class="grey lighten-5">
      <v-container>
        <v-row class="mt-5">
          <v-col cols="12" md="6">
            <h1 class="mb-1">Decentralized Creator Support Platform</h1>
            <p class="text--secondary mb-10">
              A global creator support platform that allows fans to support Creators with Cryptocurrencies and NFTs
            </p>

            <v-btn depressed link to="/connect" class="primary">Get Started</v-btn>
          </v-col>

          <v-col cols="12" md="6">
            <img src="/assets/images/creative.svg" width="100%" />
          </v-col>
        </v-row>
      </v-container>
    </header>

    <h2 class="mb-3 text-center my-10">Features</h2>
    <v-container>
      <v-row>
        <v-col cols="12" md="6" v-for="(feature, i) in features" :key="i">
          <v-card flat>
            <v-card-text>
              <div class="d-flex">
                <v-avatar size="50" :class="`mb-3 ${feature.color} me-5`">
                  <v-icon dark>{{ feature.icon }}</v-icon>
                </v-avatar>

                <div class="float-right">
                  <p class="mb-3" style="font-size: 18px">{{ feature.title }}</p>
                  <p class="">{{ feature.description }}</p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <div class="primary white--text my-3">
      <v-container>
        <h2 class="mb-3">Other Features</h2>

        <div class="style-none">
          <p class="mb-1"><v-icon dark>mdi-check-circle</v-icon> Login with crypto wallet.</p>
          <p class="mb-1"><v-icon dark>mdi-check-circle</v-icon> Discover Creators and NFTs.</p>
          <p class="mb-1"><v-icon dark>mdi-check-circle</v-icon> Buy NFTs from creators.</p>
          <p class="mb-1"><v-icon dark>mdi-check-circle</v-icon> Creator dashboard.</p>
        </div>
      </v-container>
    </div>

    <div class="mt-3">
      <v-container>
        <p class="">&copy; Fibril {{ new Date().getFullYear() }}</p>
      </v-container>
    </div>
  </section>
</template>

<style scoped>
h1 {
  font-size: 40px;
}
</style>
<script>
import { defineComponent, reactive, ref } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { config } from "@/config/config"
import { environment } from "@/config/environment"
import { useAuthStore } from "@/stores/auth"

export default defineComponent({
  setup() {
    const drawer = ref(null)
    const authStore = useAuthStore()

    const features = reactive([
      {
        title: "Support with Crypto Tokens",
        icon: "mdi-wallet",
        color: "primary",
        description: "Creators get support from their supporters with crypto tokes such as MATIC, DAI, USDT and USDC",
      },
      {
        title: "Support with NFTs",
        icon: "mdi-nut",
        color: "red",
        description: "Creators can be supported by their supporters with Non Fungible tokens (NFTs)",
      },
      {
        title: "Create Support Links",
        icon: "mdi-link",
        color: "green",
        description: "Creators can create support links and share it with anyone on the internet",
      },
      {
        title: "Get rewarded",
        icon: "mdi-cash",
        color: "purple",
        description: "As you support creators. You stand a chance to get rewarded by them",
      },
    ])

    return { drawer, features, util, config, environment, authStore }
  },
})
</script>
