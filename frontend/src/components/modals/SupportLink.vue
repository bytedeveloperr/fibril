<template>
  <v-dialog persistent v-model="show" max-width="500">
    <v-card class="pt-3">
      <v-card-text>
        <div class="d-flex mt-1 mb-3 justify-space-between">
          <div class="pt-1 h3">{{ link.title }}</div>
          <v-btn icon @click="toggleSupportLinkModal(link)"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <p class="">{{ link.description.substr(0, 150) }}...</p>

        <ul class="style-none my-3 pa-0">
          <li class="d-flex justify-space-between">
            <span>Creator:</span>
            <v-btn
              text
              link
              target="_blank"
              :href="`${environment.explorerUrl}/address/${link.creator}`"
              class="primary--text"
            >
              {{ util.truncateEthAddress(link.creator) }}
            </v-btn>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Amount:</span>
            <span class="pe-5">{{ link.amount }} {{ link.token && link.token.symbol }}</span>
          </li>
          <v-divider class="mb-3" />

          <li class="d-flex justify-space-between pb-3">
            <span>Date:</span>
            <span>{{ util.formatDate(Number(link.timestamp)) }}</span>
          </li>
        </ul>

        <v-btn depressed block class="primary--text" @click="copyToClipboard"
          ><v-icon small>mdi-content-copy</v-icon> copy link</v-btn
        >
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { defineComponent, inject } from "@vue/composition-api"
import { util } from "@/helpers/util"
import { environment } from "@/config/environment"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  props: ["link"],

  setup(props) {
    const toast = useToast()
    const show = inject("showSupportLinkModal")
    const toggleSupportLinkModal = inject("toggleSupportLinkModal")

    async function copyToClipboard() {
      try {
        const text = `${window.location.origin}/support/${props.link.cid}`
        await util.copyToClipboard(text)
        toast.success("Link copied to clipboard")
      } catch (e) {
        await toast.error(e.message)
      }
    }

    return { show, util, toggleSupportLinkModal, copyToClipboard, environment }
  },
})
</script>

<style scoped>
.style-none {
  list-style: none;
}
.h3 {
  font-size: 18px;
}
</style>
