import Moralis from "moralis"
import { environment } from "../config/environment"
import { SupportLink } from "../config/objects"
import { useAuthStore } from "../stores/auth"

Moralis.onAccountChanged(async () => {
  const authStore = useAuthStore()
  await authStore.authenticate(authStore.provider, { refresh: true })
})

Moralis.onDisconnect(async () => {
  const authStore = useAuthStore()
  await authStore.destroy()
})

Moralis.onChainChanged((chainId) => {
  const authStore = useAuthStore()
  authStore.updateChainId(chainId)
})

export const moralis = {
  async initialize() {
    const serverUrl = environment.moralisServerUrl
    const appId = environment.moralisAppId
    Moralis.start({ serverUrl, appId })

    await Moralis.enableWeb3()
  },

  async authenticate(provider, options = {}) {
    const user = await Moralis.User.currentAsync()
    if (options.refresh || !user) {
      return await this.connect(provider)
    }

    return user
  },

  async connect(provider, options = {}) {
    if (provider == "walletconnect") {
      options.mobileLinks = ["rainbow", "metamask", "argent", "trust", "imtoken", "pillar"]
    }

    return await Moralis.authenticate({ provider, ...options })
  },

  async logOut() {
    return Moralis.User.logOut()
  },

  toUnit({ value, type = "ETH", decimals } = {}) {
    return Moralis.Units[type](value, decimals)
  },

  async getTokenMetadata(addresses, chain = "mumbai") {
    return await Moralis.Web3API.token.getTokenMetadata({ chain, addresses })
  },

  async executeContract(options) {
    options.chain = options.chain || "mumbai"
    return await Moralis.executeFunction(options)
  },

  async runContractFunction(options) {
    options.chain = options.chain || "mumbai"
    return await Moralis.Web3API.native.runContractFunction(options)
  },

  getChainId() {
    return parseInt(Moralis.getChainId())
  },

  data: {
    async getUser(address) {
      if (!address) {
        return await Moralis.User.currentAsync()
      }

      return await Moralis.Cloud.run("getUser", { address: address.toLowerCase() })
    },

    async updateUser(data) {
      const user = await Moralis.User.currentAsync()
      user.set("name", data.name)
      user.set("category", data.category)
      user.set("shortDescription", data.shortDescription)
      user.set("longDescription", data.longDescription)
      user.set("isPublished", data.isPublished)
      user.set("avatar", data.avatar)
      user.set("facebook", data.facebook)
      user.set("twitter", data.twitter)
      user.set("linkedin", data.linkedin)
      user.set("instagram", data.instagram)
      user.set("tiktok", data.tiktok)
      user.set("youtube", data.youtube)

      await user.save()
    },

    async createSupportLink(data) {
      const link = new SupportLink()

      link.set("cid", data.cid)
      link.set("title", data.title)
      link.set("description", data.description)
      link.set("creator", data.creator)
      link.set("amount", data.amount)
      link.set("token", data.token)
      link.set("redirectTo", data.redirectTo)
      link.set("timestamp", data.timestamp)

      await link.save()
    },

    async getSupportLinks(address) {
      const query = new Moralis.Query(SupportLink)
      query.equalTo("creator", address)

      return await query.find()
    },

    async getSupportLink(cid) {
      const query = new Moralis.Query(SupportLink)
      query.equalTo("cid", cid)

      return await query.first()
    },

    async getCreators() {
      const creators = await Moralis.Cloud.run("getCreators")
      return creators
    },
  },
}
