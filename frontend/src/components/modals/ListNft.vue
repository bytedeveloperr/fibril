<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex justify-space-between">
          <p class="h3 mt-1">List NFT Item</p>
          <v-btn icon @click="toggleListingModal"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-form @submit.prevent="handleFormSubmit">
          <v-select
            label="Select Asset"
            :items="config.tokens"
            item-text="symbol"
            item-value="address"
            v-model="data.asset"
          />

          <v-text-field placeholder="Enter Amount" v-model="data.amount" />
          <v-btn type="submit" :disabled="loaders.submit" depressed block class="black white--text">Submit</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject, reactive } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { config } from "@/config/config"
import { useNftStore } from "@/stores/nft"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  props: ["address", "tokenId"],

  setup(props) {
    const nftStore = useNftStore()
    const authStore = useAuthStore()
    const show = inject("showListingModal")
    const toggleListingModal = inject("toggleListingModal")
    const data = reactive({ amount: "", asset: null })
    const loaders = reactive({ submit: false })
    const toast = useToast()

    async function handleFormSubmit() {
      loaders.submit = true

      try {
        const asset = config.tokens.find((token) => token.address == data.asset)
        await nftStore.listNft({
          asset: asset,
          amount: data.amount,
          creator: authStore.address,
          address: props.address,
          tokenId: props.tokenId,
        })

        toggleListingModal()
        toast.success("NFT listed successfully")
      } catch (e) {
        toast.error(e.message)
      }

      loaders.submit = false
    }

    return { nftStore, authStore, config, show, util, toggleListingModal, data, handleFormSubmit, loaders }
  },
})
</script>

<style scoped>
.h3 {
  font-size: 18px;
}
</style>
