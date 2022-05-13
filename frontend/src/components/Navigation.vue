<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <template v-slot:prepend>
        <v-list-item two-line>
          <v-list-item-avatar>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAA95JREFUeF7t3cFt1UAUheF5QmkiNYCUDTsk6kgBbEMv2aYEJHpAQmLBJhI1sKEFhEIP/ixdTd6f/fXYZ36fe8ZvYl8+//jzsuDv46e/UL3Wt6cbqv/weEf1Wvz94ZkOMa3fJQBo/lYA5ABEUA5QCyCAtIXWAkj+VQuYtrBCoIXoHCAHaBkoDLQKaBUg/KzpFloLoOkrBI4TXAgsBOI9bOVlgDIAEVQG6EkgAdSTwH4NJIBaBZB8r2AV8OX+lvYDoH7rza+fdIh/795TvRbvfv6XADAEAsD0ywGGHSwHuHKAAyAACoHCQBlA1FurDFAGaBmI9xCVlwFIvv0dLAACoBAoDBQCRb1C4Jp+lF0LuHKAAyAAygDCQBlA1CsDzGeAr29/034A3ZKE/PCuZB1/9+u/BIAhEAC4qdPkXzkA7srOAZDAHCAHQISsXP+vIAcw/fklVzg8t8AAwBmoBdQCECErrwVgCjb5/T2HOn4ABAAxVAYg+XKA7VMwzv/2158DIAGtAloFIEJWXggsBBJBtQCS7xWEQH1dPOrHjzJ378HT589vCAmA2Q9mqP4BgApqCMsBMMRNCxgAV34HBUAAkALTDlYGoOnzPYkBUAZABK08BzD9tn+OEQABYJ+MQf22v4NaBSABuwu4+/nXAq4c4AAIgDKAMFALEPXW/g9Stgdg+nXxyA9/u1fHn/5qmZ7/+DuC9AL0q106fgCoglgfACZgDmD6rRwABdTyHMAUzAFMvxwA9ePyHMAkzAFMvxwA9ePyHMAkzAFMvxwA9ePyHMAkzAFMvxwA9ePyHMAkzAFMvxwA9ePyHMAkzAFMv/0dQN8PML0hYvrHGHWgaf14T+D0BQTADXlYAJB8i3ckTd9AARAAtit4muBaQC0A72ErLwQO/3t3DpAD2C2M1TlADkAITWeoVgE0fS0Dx/+/vwxQBsB72MrLAGUAIqgMgN8bqAXUAugO1OJaQC2AGNq+BdDVr7X9hgq9fnUQHZ+fA+gJTPdwPX+tD4DHO9Vw6/oACIBRgGsBo/L7o2Q9/QBQBbG+FlALQISsPAcw/bg6B8gBGCI5QA4g6p1QmwPkACdgdPwQOcBx7U6pzAFygFNAOnqQHOCocifV5QA5wEkoHTtMDnBMt9Oqxh1AvxegF6A/B+v4OpPT56/j8xtCdAL0AnT8ALi/fRERdAIC4Fnk5x1VOQDJ71vapm+gAAiAWoAwMN3CdPwcQGb/hF3NtQB8EKQC4vxzCNPzzwEeLEUHQMtAYkDvwBygFjAKYCGQ5O85AL8pc9pCcf4LgdM9TMcPgEIgMTDtYDp+GYCmf/8M8B9UwonNlGAG1AAAAABJRU5ErkJggg=="
            />
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>
              {{ util.truncateEthAddress(auth.address) }}</v-list-item-title
            >
            <v-list-item-subtitle class="green--text text--darken-3"
              >Polygon Testnet</v-list-item-subtitle
            >
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider />

      <v-list dense>
        <template v-for="item in items">
          <v-list-group
            :key="item.title"
            v-if="item.children"
            :prepend-icon="item.icon"
            no-action
          >
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

          <v-list-item
            v-else
            :key="item.title"
            active-class="primary lighten-5 primary--text"
            link
            :to="item.path"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>

      <template v-slot:append>
        <div class="pa-2">
          <v-btn dark block depressed elevation="0" @click="logOut">
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar app elevation="0" class="white">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Fibril</v-toolbar-title>

      <v-spacer />

      <v-btn
        class="primary"
        depressed
        dark
        link
        to="/connect"
        v-if="!auth.authenticated"
        >Connect wallet</v-btn
      >

      <v-menu offset-y v-else>
        <template v-slot:activator="{ on, attrs }">
          <v-btn text v-bind="attrs" v-on="on"
            >{{ util.truncateEthAddress(auth.address) }}
            <v-icon>mdi-chevron-down</v-icon></v-btn
          >
        </template>
        <v-list outlined>
          <v-list-item link to="/account">
            <v-list-item-title
              ><v-icon>mdi-account</v-icon> Account</v-list-item-title
            >
          </v-list-item>
          <v-list-item link @click="logOut">
            <v-list-item-title
              ><v-icon>mdi-logout</v-icon> Logout</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from "@vue/composition-api"
import { useAuth } from "@/stores/auth"
import { util } from "@/helpers/util"

export default defineComponent({
  setup() {
    const auth = useAuth()
    const drawer = ref(null)
    const items = reactive([
      { title: "Dashboard", icon: "mdi-view-dashboard", path: "/" },
      {
        title: "Discover",
        icon: "mdi-creation",
        children: [
          {
            title: "Creators",
            icon: "mdi-account-multiple",
            path: "/discover/creators",
          },
          {
            title: "Crates",
            icon: "mdi-cube-unfolded",
            path: "/discover/crates",
          },
        ],
      },
      { title: "NFT Marketplace", icon: "mdi-store", path: "/discover/nfts" },
      // { title: "Support Links", icon: "mdi-link" },
    ])

    async function logOut() {
      await auth.logOut()
    }

    return { drawer, util, items, auth, logOut }
  },
})
</script>

<style scoped>
.v-menu__content {
  box-shadow: none;
}
</style>
