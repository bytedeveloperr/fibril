<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <template v-slot:prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <img :src="util.generateBlocky(authStore.address)" />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>{{ util.truncateEthAddress(authStore.address) }}</v-list-item-title>
            <v-list-item-subtitle class="green--text text--darken-3">
              {{ environment.networkName }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider />

      <v-list dense>
        <template v-for="(item, i) in items">
          <template v-if="item.divider">
            <v-divider :key="i" class="my-3" />
          </template>
          <template v-else>
            <v-list-group :key="item.title" v-if="item.children" :prepend-icon="item.icon" no-action>
              <template v-slot:activator>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </template>

              <v-list-item
                v-for="({ title, icon, path }, i) in item.children"
                :key="i"
                link
                :to="path"
                active-class="primary lighten-5 primary--text"
              >
                <v-list-item-icon>
                  <v-icon>{{ icon }}</v-icon>
                </v-list-item-icon>

                <v-list-item-title>{{ title }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-item v-else :key="item.title" active-class="primary lighten-5 primary--text" link :to="item.path">
              <v-list-item-icon>
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
        </template>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn dark block depressed elevation="0" @click="logOut"> Logout </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app elevation="0" class="white">
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>
      <v-toolbar-title>{{ config.appName }}</v-toolbar-title>

      <v-spacer />

      <v-btn class="primary" depressed dark link to="/connect" v-if="!authStore.authenticated">Connect wallet</v-btn>

      <v-menu offset-y v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on"
            >{{ util.truncateEthAddress(authStore.address) }} <v-icon>mdi-chevron-down</v-icon></v-btn
          >
        </template>
        <v-list outlined>
          <v-list-item link to="/account">
            <v-list-item-title><v-icon>mdi-account</v-icon> Account</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="logOut">
            <v-list-item-title><v-icon>mdi-logout</v-icon> Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from "@vue/composition-api"
import { useAuthStore } from "@/stores/auth"
import { util } from "@/helpers/util"
import { config } from "@/config/config"
import { environment } from "@/config/environment"

export default defineComponent({
  setup(_, ctx) {
    const authStore = useAuthStore()
    const drawer = ref(null)
    const items = reactive([
      { title: "Dashboard", icon: "mdi-view-dashboard", path: "/dashboard" },
      { title: "My Supporters", icon: "mdi-account-multiple", path: "/supporters" },
      { title: "My NFTs", icon: "mdi-nut", path: "/nfts" },
      { title: "Support Links", icon: "mdi-link", path: "/links" },
      {
        title: "Actions",
        icon: "mdi-chemical-weapon",
        children: [{ title: "Reward", icon: "mdi-trophy-award", path: "/actions/reward" }],
      },
      { divider: true },
      {
        title: "Discover",
        icon: "mdi-creation",
        children: [
          { title: "Creators", icon: "mdi-account-multiple", path: "/discover/creators" },
          { title: "NFTs", icon: "mdi-nut", path: "/discover/nfts" },
        ],
      },
    ])

    async function logOut() {
      await authStore.logOut()
      ctx.$router.push("/connect")
    }

    return { drawer, util, items, authStore, logOut, config, environment }
  },
})
</script>

<style scoped>
.v-menu__content {
  box-shadow: none;
}
</style>
