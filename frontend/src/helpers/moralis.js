import Moralis from "moralis"
import { environment } from "../config/environment"
import { useAuth } from "../stores/auth"

Moralis.onAccountChanged(async () => {
  const auth = useAuth()
  await auth.authenticate(auth.provider, { refresh: true })
})

Moralis.onDisconnect(async () => {
  const auth = useAuth()
  await auth.destroy()
})

export const moralis = {
  initialize() {
    const serverUrl = environment.moralisServerUrl
    const appId = environment.moralisAppId
    Moralis.start({ serverUrl, appId })

    Moralis.enableWeb3()
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

      await user.save()
    },

    async getCreators() {
      const creators = await Moralis.Cloud.run("getCreators")
      return creators
    },
  },
}
