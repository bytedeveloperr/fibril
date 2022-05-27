<template>
  <div>
    <v-list two-line class="pt-0">
      <template v-for="(link, i) in links">
        <v-list-item :key="'link' + i" link @click="toggleSupportLinkModal(link)">
          <!-- <v-list-item-avatar tile rounded="10" size="38.5" color="grey lighten-4">
          <v-img
            src="https://images.unsplash.com/photo-1493612276216-ee3925520721?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"
          />
        </v-list-item-avatar> -->

          <v-list-item-content>
            <v-list-item-title class="mb-2">{{ link.title }}</v-list-item-title>
            <v-list-item-subtitle>Created at {{ util.formatDate(link.timestamp) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-title class="mb-2">{{ link.amount }} {{ link.token.symbol }}</v-list-item-title>
          </v-list-item-action>
        </v-list-item>
        <v-divider :key="'divider-' + i" />
      </template>
    </v-list>

    <SupportLinkModal v-if="!!link" :link="link" />
  </div>
</template>

<script>
import { defineComponent, provide, ref } from "@vue/composition-api"
import SupportLinkModal from "@/components/modals/SupportLink"
import { util } from "@/helpers/util"

export default defineComponent({
  props: ["links"],
  components: { SupportLinkModal },
  setup() {
    const link = ref(null)
    const showSupportLinkModal = ref(null)

    function toggleSupportLinkModal(val) {
      showSupportLinkModal.value = !showSupportLinkModal.value
      link.value = val
    }
    provide("showSupportLinkModal", showSupportLinkModal)
    provide("toggleSupportLinkModal", toggleSupportLinkModal)

    return { util, link, toggleSupportLinkModal }
  },
})
</script>
