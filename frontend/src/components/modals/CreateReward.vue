<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex justify-space-between">
          <p class="h3 mt-1">Reward supporters</p>
          <v-btn icon @click="toggleCreateRewardModal"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-form @submit.prevent="handleFormSubmit">
          <v-select
            label="Select Asset"
            :items="config.tokens"
            item-text="symbol"
            item-value="address"
            v-model="data.asset"
          />
          <v-text-field placeholder="Enter amount per winner" v-model="data.amount" />
          <v-text-field placeholder="Enter amount of possible winners" v-model="data.winners" />

          <v-btn depressed block dark :disabled="loaders.submit" type="submit">Continue</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject, reactive } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { config } from "@/config/config"
import { useRewardStore } from "@/stores/reward"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  setup(_, ctx) {
    const toast = useToast()
    const { $router } = ctx.root
    const authStore = useAuthStore()
    const rewardStore = useRewardStore()
    const loaders = reactive({ submit: false })
    const show = inject("showCreateRewardModal")
    const toggleCreateRewardModal = inject("toggleCreateRewardModal")
    const data = reactive({ amount: "", asset: null, winners: "" })

    async function handleFormSubmit() {
      loaders.submit = true

      try {
        const asset = config.tokens.find((balance) => balance.address == data.asset)
        await rewardStore.rewardRandomSupporters({
          asset: asset,
          amount: data.amount,
          winners: data.winners,
          creator: authStore.address,
        })

        toast.success("Reward in progess")
        $router.push(`/dashboard`)
      } catch (e) {
        toast.error(e.data?.message || e.message)
      }

      loaders.submit = false
    }

    return { authStore, config, show, util, toggleCreateRewardModal, data, handleFormSubmit, loaders }
  },
})
</script>

<style scoped>
.h3 {
  font-size: 18px;
}
</style>
