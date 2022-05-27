<template>
  <v-row>
    <Loader v-if="loaders.mount" />

    <v-col v-else md="6" class="mx-auto">
      <p class="h1">Withdraw Asset</p>

      <v-form @submit.prevent="handleFormSubmit" ref="form">
        <v-select :rules="rules" placeholder="Select Support Method" v-model="data.method" :items="config.methods" />

        <template v-if="data.method == 'Token'">
          <v-select
            label="Select Asset"
            :items="config.tokens"
            item-text="symbol"
            item-value="address"
            v-model="data.asset"
            :rules="data.method == 'Token' ? rules : []"
          />
          <v-text-field
            :rules="data.method == 'Token' ? rules : []"
            type="number"
            placeholder="Enter Amount"
            v-model="data.amount"
          />
        </template>

        <template v-else-if="data.method == 'NFT'">
          <v-text-field
            :rules="data.method == 'NFT' ? rules : []"
            placeholder="Enter Contract Address"
            v-model="data.nftAddress"
          />
          <v-text-field
            :rules="data.method == 'NFT' ? rules : []"
            type="number"
            placeholder="Enter Token ID"
            v-model="data.tokenId"
          />
        </template>
        <v-text-field :rules="rules" placeholder="Enter Recipient" v-model="data.recipient" />

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
import { defineComponent, onMounted, reactive, ref } from "@vue/composition-api"
import { useUserStore } from "@/stores/user"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"
import Loader from "@/components/Loader"
import { config } from "@/config/config"

export default defineComponent({
  components: { Loader },

  setup() {
    const form = ref(null)
    const toast = useToast()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const loaders = reactive({ mount: false, submit: false })
    const rules = [(v) => !!v || "This field is required"]

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
        if (!form.value.validate()) return

        if (data.method == "Token") {
          const asset = config.tokens.find((balance) => balance.address == data.asset)
          await userStore.withdrawAsset({
            asset: asset,
            amount: data.amount,
            method: data.method,
            recipient: data.recipient,
            creator: userStore.data.address,
          })
        } else if (data.method == "NFT") {
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
      } finally {
        loaders.submit = false
      }
    }

    return { userStore, authStore, config, data, handleFormSubmit, loaders, form, rules }
  },
})
</script>
