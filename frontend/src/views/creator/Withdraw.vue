<template>
  <v-row>
    <Loader v-if="loaders.mount" />

    <v-col v-else md="6" class="mx-auto">
      <p class="h1">Withdraw Asset</p>

      <v-form @submit.prevent="handleFormSubmit">
        <v-select placeholder="Select Support Method" v-model="data.method" :items="config.methods" />

        <template v-if="data.method == 'Token'">
          <v-select
            label="Select Asset"
            :items="config.tokens"
            item-text="symbol"
            item-value="address"
            v-model="data.asset"
          />
          <v-text-field placeholder="Enter Recipient" v-model="data.recipient" />
          <v-text-field placeholder="Enter Amount" v-model="data.amount" />
        </template>

        <template v-else-if="data.method == 'NFT'">
          <v-text-field placeholder="Enter Contract Address" v-model="data.nftAddress" />
          <v-text-field placeholder="Enter Token ID" v-model="data.tokenId" />
          <v-text-field placeholder="Enter Recipient" v-model="data.recipient" />
        </template>

        <v-btn depressed block rounded :disabled="loaders.submit" type="submit" class="primary">Continue</v-btn>
      </v-form>
    </v-col>
  </v-row>
</template>

<style scoped>
.h1 {
  font-size: 23px;
}
</style>

<script>
import { defineComponent, onMounted, reactive } from "@vue/composition-api"
import { useUserStore } from "@/stores/user"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"
import Loader from "@/components/Loader"
import { config } from "@/config/config"

export default defineComponent({
  components: { Loader },

  setup() {
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const toast = useToast()
    const loaders = reactive({ mount: false, submit: false })
    const data = reactive({
      method: null,
      amount: null,
      recipient: authStore.address,
      nftAddress: null,
      tokenId: null,
      asset: null,
    })

    onMounted(async () => {
      loaders.mount = true

      try {
        await userStore.getUser(authStore.address)
      } catch (e) {
        toast.error(e.message)
      }

      loaders.mount = false
    })

    async function handleFormSubmit() {
      loaders.submit = true

      try {
        if (data.method == "Token") {
          const asset = config.tokens.find((balance) => balance.address == data.asset)
          await userStore.withdrawAsset({
            asset: asset,
            amount: data.amount,
            method: data.method,
            recipient: data.recipient,
            creator: userStore.data.address,
          })
        } else {
          await userStore.withdrawAsset({
            method: data.method,
            tokenId: data.tokenId,
            recipient: data.recipient,
            creator: userStore.data.address,
            nftAddress: data.nftAddress,
          })
        }

        toast.success("Withdrawal is successful")
      } catch (e) {
        toast.error(e.data?.message || e.message)
      }

      loaders.submit = false
    }

    return { userStore, authStore, config, data, handleFormSubmit, loaders }
  },
})
</script>
