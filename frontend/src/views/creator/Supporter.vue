<template>
  <v-row>
    <Loader v-if="loaders.mount" />
    <v-col md="8" v-else class="mx-auto">
      <div class="d-flex justify-space-between">
        <h4 class="text-overline mb-3">Supporter</h4>
        <v-btn depressed class="black--text"> <v-icon>mdi-arrow-down-drop-circle</v-icon> Actions </v-btn>
      </div>

      <p class="mb-3">
        Supporter
        <v-btn
          text
          link
          target="_blank"
          :href="`${environment.explorerUrl}/address/${supporter.value.address}`"
          class="primary--text pa-0"
        >
          {{ supporter.value.address && supporter.value.address.toUpperCase().substr(0, 6) }}
        </v-btn>
        has supported you with:
      </p>
      <Balances :balances="supporter.value.supports" />
    </v-col>
  </v-row>
</template>

<script>
import { defineComponent, onMounted, reactive } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Balances from "@/components/lists/Balances"
import Supporters from "@/components/lists/Supporters"
import { useToast } from "vue-toastification/composition"
import { useDashboardStore } from "@/stores/dashboard"
import { environment } from "@/config/environment"

export default defineComponent({
  components: { Balances, Supporters, Loader },

  setup(_, ctx) {
    const { $route } = ctx.root
    const toast = useToast()
    const dashboardStore = useDashboardStore()
    const supporter = reactive({ value: {} })
    const loaders = reactive({ mount: false })

    onMounted(async () => {
      loaders.mount = true

      try {
        supporter.value = await dashboardStore.getCreatorSupporter($route.params.id)
        supporter.value.supports = supporter.value.supports.map((s, i) => ({
          amount: supporter.value.supports[i].amount,
          ...s.token,
        }))

        console.log(JSON.parse(JSON.stringify(supporter.value.supports)))
      } catch (e) {
        toast.error(e.message)
      }

      loaders.mount = false
    })

    return { supporter, loaders, environment }
  },
})
</script>
