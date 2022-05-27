<template>
  <v-row>
    <Loader v-if="loaders.mount" />

    <v-col v-else md="6" class="mx-auto">
      <p class="h1">Support {{ userStore.data.name }}</p>

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
            type="number"
            :rules="data.method == 'Token' ? rules : []"
            placeholder="Enter Amount"
            v-model="data.amount"
          />
        </template>

        <template v-else-if="data.method == 'NFT'">
          <v-text-field
            :rules="data.method == 'NFT' ? rules : []"
            placeholder="Enter Contract Address"
            v-model="data.contract"
          />
          <v-text-field
            type="number"
            :rules="data.method == 'NFT' ? rules : []"
            placeholder="Enter Token ID"
            v-model="data.tokenId"
          />
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
import Loader from "@/components/Loader"
import { config } from "@/config/config"
import { useUserStore } from "@/stores/user"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"
import { defineComponent, onMounted, reactive, ref } from "@vue/composition-api"

export default defineComponent({
  components: { Loader },

  setup(_, ctx) {
    const { $route, $router } = ctx.root

    const form = ref(null)
    const toast = useToast()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const rules = [(v) => !!v || "This field is required"]
    const loaders = reactive({ submit: false, mount: false })
    const data = reactive({ method: null, amount: null, contract: null, tokenId: null, asset: null })

    onMounted(async () => {
      loaders.mount = true

      try {
        await userStore.getUser($route.params.id)
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
          await userStore.supportCreator({
            method: data.method,
            amount: data.amount,
            asset: asset,
            creator: userStore.data.address,
            supporter: authStore.address,
          })
        } else if (data.method == "NFT") {
          await userStore.supportCreator({
            method: data.method,
            creator: userStore.data.address,
            supporter: authStore.address,
            contract: data.contract,
            tokenId: data.tokenId,
          })
        }

        toast.success("Creator supported successfully")
        $router.push(`/creator/${$route.params.id}`)
      } catch (e) {
        toast.error(e.data?.message || e.message)
      } finally {
        loaders.submit = false
      }
    }

    return { userStore, config, data, handleFormSubmit, loaders, rules, form }
  },
})
</script>
