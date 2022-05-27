<template>
  <v-row>
    <Loader v-if="linkStore.loading" />
    <v-col v-else cols="12" md="8" class="mx-auto d-block">
      <div class="d-flex justify-space-between">
        <p class="text-overline">Support Links</p>
        <v-btn smvalue depressed class="primary--text" @click="toggleCreateSupportLinkModal">Create link</v-btn>
      </div>

      <Empty v-if="linkStore.links.length < 1" text="No support links yet" />
      <SupportLinks :links="linkStore.links" />
    </v-col>

    <CreateSupportLinkModal />
  </v-row>
</template>

<script>
import { defineComponent, onMounted, provide, ref } from "@vue/composition-api"
import CreateSupportLinkModal from "@/components/modals/CreateSupportLink"
import SupportLinks from "@/components/lists/SupportLinks"
import { useToast } from "vue-toastification/composition"
import { useLinkStore } from "@/stores/link"
import Loader from "@/components/Loader"
import Empty from "@/components/Empty"

export default defineComponent({
  components: { SupportLinks, CreateSupportLinkModal, Loader, Empty },

  setup() {
    const toast = useToast()
    const linkStore = useLinkStore()
    const showCreateSupportLinkModal = ref(null)

    onMounted(async () => {
      try {
        await linkStore.loadSupportLinks()
      } catch (e) {
        toast.error(e.message)
      }
    })

    function toggleCreateSupportLinkModal() {
      showCreateSupportLinkModal.value = !showCreateSupportLinkModal.value
    }
    provide("showCreateSupportLinkModal", showCreateSupportLinkModal)
    provide("toggleCreateSupportLinkModal", toggleCreateSupportLinkModal)

    return { linkStore, toggleCreateSupportLinkModal }
  },
})
</script>
