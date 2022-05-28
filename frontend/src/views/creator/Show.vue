<template>
  <div>
    <Loader v-if="loaders.mount" />
    <v-row v-else class="mt-3">
      <v-col md="8" cols="12" class="mx-auto pt-0">
        <div>
          <div class="d-flex justify-space-between">
            <div>
              <v-avatar tile class="mx-auto" size="100">
                <v-img :src="userStore.data.avatar || '/assets/images/default.jpg'" />
              </v-avatar>
              <p class="big font-weight-bold mb-0 mt-3">{{ userStore.data.name }}</p>
            </div>

            <v-btn
              depressed
              link
              class="primary--text primary lighten-5"
              :to="`/creator/${userStore.data.address}/support`"
            >
              <v-icon>mdi-leaf</v-icon> Support
            </v-btn>
          </div>
          <p class="text--secondary text-small mt-0">{{ userStore.data.shortDescription }}</p>
        </div>

        <v-tabs v-model="tab" class="mb-3">
          <v-tab class="font-weight-bold">Assets</v-tab>
          <v-tab class="font-weight-bold">NFTs</v-tab>
          <v-tab class="font-weight-bold">About</v-tab>
        </v-tabs>

        <template v-if="tab == 0">
          <BalancesList :balances="dashboardStore.balances" />
        </template>
        <template v-if="tab == 1">
          <v-row>
            <Empty v-if="nftStore.nfts.length < 1" text="Creator does not have any NFT" />
            <v-col v-for="(item, i) in nftStore.nfts" :key="'nft-' + i" md="5" cols="12">
              <NftCard :item="item" :authStore="authStore" :nftStore="nftStore" />
            </v-col>
          </v-row>
        </template>
        <template v-if="tab == 2">
          <p class="text--secondary mb-5">
            <span v-if="userStore.data.longDescription">{{ userStore.data.longDescription }}</span>
            <span v-else>- Creator does not have a description</span>
          </p>

          <div>
            <h4 class="h4 mb-3">Social Profiles</h4>
            <ul class="style-none pa-0">
              <li class="d-flex justify-space-between">
                <v-avatar size="30">
                  <v-img src="/assets/images/facebook.svg" />
                </v-avatar>
                <v-btn
                  text
                  link
                  class="primary--text"
                  :href="userStore.data.twitter"
                  target="_blank"
                  v-if="userStore.data.facebook"
                  >{{ userStore.data.facebook }}</v-btn
                >
                <p class="text--secondary" v-else>Not added yet</p>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between">
                <v-avatar size="30">
                  <v-img src="/assets/images/twitter.svg" />
                </v-avatar>
                <v-btn
                  text
                  link
                  class="primary--text"
                  :href="userStore.data.twitter"
                  target="_blank"
                  v-if="userStore.data.twitter"
                  >{{ userStore.data.twitter }}</v-btn
                >
                <p class="text--secondary" v-else>Not added yet</p>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between">
                <v-avatar size="30">
                  <v-img src="/assets/images/linkedin.svg" />
                </v-avatar>
                <v-btn
                  text
                  link
                  class="primary--text"
                  :href="userStore.data.twitter"
                  target="_blank"
                  v-if="userStore.data.linkedin"
                  >{{ userStore.data.linkedin }}</v-btn
                >
                <p class="text--secondary" v-else>Not added yet</p>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between">
                <v-avatar size="30">
                  <v-img src="/assets/images/youtube.svg" />
                </v-avatar>
                <v-btn
                  text
                  link
                  class="primary--text"
                  :href="userStore.data.twitter"
                  target="_blank"
                  v-if="userStore.data.youtube"
                  >{{ userStore.data.youtube }}</v-btn
                >
                <p class="text--secondary" v-else>Not added yet</p>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between">
                <v-avatar size="30">
                  <v-img src="/assets/images/instagram.svg" />
                </v-avatar>
                <v-btn
                  text
                  link
                  class="primary--text"
                  :href="userStore.data.twitter"
                  target="_blank"
                  v-if="userStore.data.instagram"
                  >{{ userStore.data.instagram }}</v-btn
                >
                <p class="text--secondary" v-else>Not added yet</p>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between">
                <v-avatar size="30">
                  <v-img src="/assets/images/tiktok.svg" />
                </v-avatar>
                <v-btn
                  text
                  link
                  class="primary--text"
                  :href="userStore.data.twitter"
                  target="_blank"
                  v-if="userStore.data.tiktok"
                  >{{ userStore.data.tiktok }}</v-btn
                >
                <p class="text--secondary" v-else>Not added yet</p>
              </li>
              <v-divider class="mb-3" />
            </ul>
          </div>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.big {
  font-size: 20px;
}
.h4 {
  font-size: 18px;
}
</style>

<script>
import { defineComponent, onMounted, reactive, ref } from "@vue/composition-api"
import Empty from "@/components/Empty"
import Loader from "@/components/Loader"
import Balance from "@/components/cards/Balance"
import Activities from "@/components/lists/Activities"
import SupportersList from "@/components/lists/Supporters"
import BalancesList from "@/components/lists/Balances"
import { useDashboardStore } from "@/stores/dashboard"
import { useNftStore } from "@/stores/nft"
import { useToast } from "vue-toastification/composition"
import NftCard from "@/components/cards/Nft"
import { useUserStore } from "@/stores/user"
import { useAuthStore } from "@/stores/auth"

export default defineComponent({
  components: { Balance, Activities, SupportersList, NftCard, BalancesList, Loader, Empty },

  setup(_, ctx) {
    const tab = ref(null)
    const toast = useToast()
    const { $route } = ctx.root
    const nftStore = useNftStore()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const dashboardStore = useDashboardStore()
    const loaders = reactive({ mount: false })

    onMounted(async () => {
      loaders.mount = true

      try {
        await userStore.getUser($route.params.id)
        await dashboardStore.loadBalances($route.params.id)
        await nftStore.loadNfts($route.params.id)
      } catch (e) {
        toast.error(e.message)
      }

      loaders.mount = false
    })

    return { authStore, dashboardStore, nftStore, tab, userStore, loaders }
  },
})
</script>
