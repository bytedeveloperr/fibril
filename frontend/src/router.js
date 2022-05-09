import Vue from "vue"
import VueRouter from "vue-router"
import Home from "@/views/Home.vue"
import Connect from "@/views/Connect.vue"
import Discover from "@/views/Discover.vue"
import ShowCreator from "@/views/creator/Show.vue"
import CreatorAccount from "@/views/creator/Account.vue"
import WithdrawAsset from "@/views/creator/Withdraw.vue"
import SupportCreator from "@/views/creator/Support.vue"
import NftItem from "@/views/nft/Item.vue"

Vue.use(VueRouter)

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/connect", name: "Connect", component: Connect },
  { path: "/discover/:entity", name: "Discover", component: Discover },
  { path: "/account", name: "CreatorAccount", component: CreatorAccount },
  { path: "/withdraw", name: "WithdrawAsset", component: WithdrawAsset },
  { path: "/creator/:id", name: "ShowCreator", component: ShowCreator },
  { path: "/creator/:id/support", name: "SupportCreator", component: SupportCreator },
  { path: "/nft/:id", name: "NftItem", component: NftItem },
]

export const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

// Decentralized support platform for creators and payment Businesses
