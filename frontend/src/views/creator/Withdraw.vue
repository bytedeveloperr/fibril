<template>
  <v-row>
    <Loader v-if="user.loading" />

    <v-col v-else md="6" class="mx-auto">
      <p class="h1">Withdraw Asset</p>

      <v-form @submit.prevent="handleFormSubmit">
        <v-select placeholder="Select Support Method" v-model="data.method" :items="methods" />

        <template v-if="data.method == 'Token'">
          <v-select label="Select Asset" :items="dashboard.balances" item-text="symbol" item-value="address" v-model="data.asset" />
          <v-text-field placeholder="Enter Recipient" v-model="data.recipient" />
          <v-text-field placeholder="Enter Amount" v-model="data.amount" />
        </template>

        <template v-else-if="data.method == 'NFT'">
          <v-text-field placeholder="Enter Contract Address" />
          <v-text-field placeholder="Enter Token ID" />
        </template>

        <v-btn depressed block rounded type="submit" class="primary">Continue</v-btn>
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
import { useUser } from "@/stores/user"
import { useAuth } from "@/stores/auth"
import { useDashboard } from "@/stores/dashboard"
import Loader from "@/components/Loader"

export default defineComponent({
  components: { Loader },

  setup() {
    const user = useUser()
    const auth = useAuth()
    const dashboard = useDashboard()
    const methods = ["NFT", "Token"]
    const data = reactive({ method: null, amount: null, recipient: auth.address, contract: null, tokenId: null, asset: null })

    onMounted(async () => {
      await user.getUser(auth.address)
      await dashboard.loadBalances()
    })

    async function handleFormSubmit() {
      if (data.method == "Token") {
        const asset = dashboard.balances.find((balance) => balance.address == data.asset)
        await user.withdrawAsset({ amount: data.amount, asset: asset, creator: user.data.address, recipient: auth.address })
      }
    }

    return { user, auth, methods, data, dashboard, handleFormSubmit }
  },
})
</script>
