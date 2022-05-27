import { defineStore } from "pinia"
import { fibril } from "../helpers/fibril"
import { moralis } from "../helpers/moralis"

export const useUserStore = defineStore("user", {
  state: () => ({
    loading: false,
    data: {
      id: "",
      name: "",
      shortDescription: "",
      address: "",
      category: "",
      avatar: "",
      isPublished: false,
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      tiktok: "",
      instagram: "",
    },
  }),

  actions: {
    async getUser(address) {
      this.loading = true

      const user = await moralis.data.getUser(address)
      if (!user) {
        throw new Error("User does not exist")
      }
      const { attributes } = user

      this.data.id = user.id
      this.data.name = attributes.name
      this.data.shortDescription = attributes.shortDescription
      this.data.address = attributes.ethAddress
      this.data.category = attributes.category
      this.data.isPublished = attributes.isPublished
      this.data.avatar = attributes.avatar
      this.data.facebook = attributes.facebook
      this.data.twitter = attributes.twitter
      this.data.tiktok = attributes.tiktok
      this.data.linkedin = attributes.linkedin
      this.data.youtube = attributes.youtube
      this.data.instagram = attributes.instagram

      this.loading = false
    },

    async updateUser() {
      await moralis.data.updateUser(this.data)
    },

    async updateAvatar(url) {
      this.data.avatar = url
      await this.updateUser()
    },

    async getCreators() {
      const users = await moralis.data.getCreators()
      return users.map((user) => user.attributes)
    },

    async supportCreator(data) {
      if (data.method == "Token") {
        await fibril.supportCreator(data)
      } else {
        await fibril.supportCreatorWithNft(data)
      }
    },

    async withdrawAsset(data) {
      if (data.method == "Token") {
        await fibril.withdrawToken(data)
      } else {
        await fibril.withdrawNft(data)
      }
    },
  },
})
