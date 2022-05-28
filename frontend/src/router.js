import Vue from "vue"
import VueRouter from "vue-router"
import Dashboard from "@/views/Dashboard.vue"
import Home from "@/views/Home.vue"
import Connect from "@/views/Connect.vue"
import Discover from "@/views/Discover.vue"
import ShowCreator from "@/views/creator/Show.vue"
import CreatorAccount from "@/views/creator/Account.vue"
import WithdrawAsset from "@/views/creator/Withdraw.vue"
import SupportCreator from "@/views/creator/Support.vue"
import RewardSupporters from "@/views/creator/actions/Reward.vue"
import CreatorActivities from "@/views/creator/Activities.vue"
import CreatorSupporters from "@/views/creator/Supporters.vue"
import ShowSupporter from "@/views/creator/Supporter.vue"
import NftDashBoard from "@/views/creator/Nfts.vue"
import NftItem from "@/views/nft/Item.vue"
import SupportLinks from "@/views/links/List.vue"
import ShowSupportLink from "@/views/links/Show.vue"

import { useAuthStore } from "./stores/auth"

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/connect", name: "Connect", component: Connect, meta: { ensureGuest: true } },

  { path: "/dashboard", name: "Dashboard", component: Dashboard, meta: { ensureAuth: true } },
  { path: "/withdraw", name: "WithdrawAsset", component: WithdrawAsset, meta: { ensureAuth: true } },
  { path: "/account", name: "CreatorAccount", component: CreatorAccount, meta: { ensureAuth: true } },
  { path: "/links", name: "SupportLinks", component: SupportLinks, meta: { ensureAuth: true } },
  { path: "/activities", name: "CreatorActivities", component: CreatorActivities, meta: { ensureAuth: true } },
  { path: "/supporters", name: "CreatorSupporters", component: CreatorSupporters, meta: { ensureAuth: true } },

  { path: "/nfts", name: "NftDashBoard", component: NftDashBoard },
  { path: "/nft/:id", name: "NftItem", component: NftItem },

  { path: "/discover/:entity", name: "Discover", component: Discover },

  { path: "/creator/:id", name: "ShowCreator", component: ShowCreator },
  { path: "/creator/:id/support", name: "SupportCreator", component: SupportCreator, meta: { ensureAuth: true } },

  { path: "/support/:cid", name: "ShowSupportLink", component: ShowSupportLink },
  { path: "/supporter/:id", name: "ShowSupporter", component: ShowSupporter, meta: { ensureAuth: true } },
  { path: "/actions/reward", name: "RewardSupporters", component: RewardSupporters, meta: { ensureAuth: true } },
]

export function router() {
  Vue.use(VueRouter)

  const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
  })

  router.beforeEach((to, from, next) => {
    if (to.meta.ensureAuth) {
      console.log("guarded...")
      if (!useAuthStore().authenticated) {
        console.log("not auth")
        return next(`/connect?next=${to.fullPath}`)
      }

      console.log("has auth")
      return next()
    } else if (to.meta.ensureGuest) {
      console.log("guest...")
      if (useAuthStore().authenticated) {
        console.log("has auth")
        return next("/dashboard")
      }

      console.log("not auth")
      return next()
    } else {
      console.log("neutral")
      return next()
    }
  })

  return router
}
