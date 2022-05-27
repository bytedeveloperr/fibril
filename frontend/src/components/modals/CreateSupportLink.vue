<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex justify-space-between">
          <p class="h3 mt-1">Support link</p>
          <v-btn icon @click="toggleCreateSupportLinkModal"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-form @submit.prevent="handleFormSubmit" ref="form">
          <v-text-field type="text" placeholder="Link Title" v-model="data.title" :rules="rules" />
          <v-select
            label="Select Token"
            :items="config.tokens"
            item-text="symbol"
            item-value="address"
            v-model="data.token"
            :rules="rules"
          />
          <v-text-field type="number" placeholder="Enter Amount" v-model="data.amount" :rules="rules" />
          <v-textarea placeholder="Link Description" v-model="data.description" :rules="rules" />
          <v-text-field type="text" placeholder="Link Redirect URL (Optional)" v-model="data.redirectTo" />

          <v-btn type="submit" :disabled="loaders.submit" depressed block class="black white--text">Create Link</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject, reactive, ref } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { storage } from "@/helpers/storage"
import { config } from "@/config/config"
import { useLinkStore } from "@/stores/link"
import { useAuthStore } from "@/stores/auth"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  setup() {
    const form = ref(null)
    const toast = useToast()
    const authStore = useAuthStore()
    const linkStore = useLinkStore()
    const loaders = reactive({ submit: false })
    const show = inject("showCreateSupportLinkModal")
    const toggleCreateSupportLinkModal = inject("toggleCreateSupportLinkModal")
    const data = reactive({ amount: "", token: "", title: "", creator: "", redirectTo: "", description: "" })
    const rules = [(v) => !!v || "This field is required"]

    async function handleFormSubmit() {
      loaders.submit = true

      try {
        if (!form.value.validate()) return

        const asset = config.tokens.find((token) => token.address == data.token)

        data.timestamp = Date.now()
        data.creator = authStore.address
        data.cid = await storage.uploadFile(new File([JSON.stringify(data)], "support.json"))

        await linkStore.createSupportLink({ ...data, amount: Number(data.amount) * Math.pow(10, asset.decimals) })
        toggleCreateSupportLinkModal()

        toast.success("Support link created successfully")
      } catch (e) {
        toast.error(e.message)
      } finally {
        loaders.submit = false
      }
    }

    return { authStore, config, show, util, toggleCreateSupportLinkModal, data, handleFormSubmit, loaders, form, rules }
  },
})
</script>

<style scoped>
.h3 {
  font-size: 18px;
}
</style>
