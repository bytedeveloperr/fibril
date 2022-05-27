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

Vue.use(VueRouter)

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/dashboard", name: "Dashboard", component: Dashboard },
  { path: "/connect", name: "Connect", component: Connect },
  { path: "/discover/:entity", name: "Discover", component: Discover },
  { path: "/account", name: "CreatorAccount", component: CreatorAccount },
  { path: "/withdraw", name: "WithdrawAsset", component: WithdrawAsset },
  { path: "/nfts", name: "NftDashBoard", component: NftDashBoard },
  { path: "/creator/:id", name: "ShowCreator", component: ShowCreator },
  {
    path: "/creator/:id/support",
    name: "SupportCreator",
    component: SupportCreator,
  },
  { path: "/nft/:id", name: "NftItem", component: NftItem },
  { path: "/links", name: "SupportLinks", component: SupportLinks },
  { path: "/support/:cid", name: "ShowSupportLink", component: ShowSupportLink },
  { path: "/activities", name: "CreatorActivities", component: CreatorActivities },
  { path: "/supporters", name: "CreatorSupporters", component: CreatorSupporters },
  { path: "/supporter/:id", name: "ShowSupporter", component: ShowSupporter },
  { path: "/actions/award", name: "RewardSupporters", component: RewardSupporters },
]

export const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})
