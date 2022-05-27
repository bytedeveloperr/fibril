<template>
  <v-row>
    <v-col md="8" class="mx-auto">
      <v-card flat outlined>
        <v-card-text>
          <div class="mb-0 d-flex justify-space-between">
            <h5 class="text-overline">Supporters</h5>
          </div>

          <Loader v-if="loaders.mount" />
          <Supporters v-else :supporters="supporters.value" />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, onMounted, reactive } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Balance from "@/components/cards/Balance"
import Supporters from "@/components/lists/Supporters"
import { useToast } from "vue-toastification/composition"
import { useDashboardStore } from "@/stores/dashboard"

export default defineComponent({
  components: { Balance, Supporters, Loader },

  setup() {
    const toast = useToast()
    const dashboardStore = useDashboardStore()
    const supporters = reactive({ value: {} })
    const loaders = reactive({ mount: false })

    onMounted(async () => {
      loaders.mount = true
      try {
        supporters.value = await dashboardStore.getCreatorSupporters()
      } catch (e) {
        console.log(e)
        toast.error(e.message)
      }
      loaders.mount = false
    })

    return { supporters, loaders }
  },
})
</script>
