<template>
  <v-row>
    <v-col md="8" class="mx-auto">
      <div class="mb-0 d-flex justify-space-between">
        <h5 class="text-overline">Activities</h5>
      </div>

      <Loader v-if="loaders.mount" />
      <Activities v-else :activities="activities.value" />
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, onMounted, reactive } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Balance from "@/components/cards/Balance"
import Activities from "@/components/lists/Activities"
import { useToast } from "vue-toastification/composition"
import { useDashboardStore } from "@/stores/dashboard"

export default defineComponent({
  components: { Balance, Activities, Loader },

  setup() {
    const toast = useToast()
    const dashboardStore = useDashboardStore()
    const activities = reactive({ value: {} })
    const loaders = reactive({ mount: false })

    onMounted(async () => {
      loaders.mount = true
      try {
        activities.value = await dashboardStore.getCreatorActivities()
      } catch (e) {
        console.log(e)
        toast.error(e.message)
      }
      loaders.mount = false
    })

    return { activities, loaders }
  },
})
</script>
