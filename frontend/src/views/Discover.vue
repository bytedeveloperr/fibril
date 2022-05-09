<template>
  <div>
    <h5 class="text-overline mb-5">Discover {{ $route.params.entity }}</h5>

    <v-row>
      <v-col md="6" cols="12" class="my-0 py-0">
        <v-text-field placeholder="Search..." outlined dense />
      </v-col>
      <v-col md="6" cols="12" class="my-0 py-0">
        <v-select label="Fiter by category" outlined dense></v-select>
      </v-col>
    </v-row>

    <v-row>
      <Loader v-if="loading" />
      <template v-else>
        <Empty v-if="items.value.length < 1" />

        <v-col v-else v-for="(item, i) in items.value" :key="'c-' + i" md="3">
          <Creator v-if="$route.params.entity === 'creators'" :item="item" />
          <Crate v-else-if="$route.params.entity === 'crates'" :item="item" />
          <Nft v-else-if="$route.params.entity === 'nfts'" :item="item" />
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, ref, watch } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Empty from "@/components/Empty"
import Creator from "@/components/cards/Creator"
import Crate from "@/components/cards/Crate"
import Nft from "@/components/cards/Nft"
import { useUser } from "@/stores/user"
import { useDashboard } from "@/stores/dashboard"

export default defineComponent({
  components: { Creator, Crate, Nft, Loader, Empty },
  setup(_, ctx) {
    const user = useUser()
    const dashboard = useDashboard()
    const loading = ref(null)
    const items = reactive({ value: [] })

    async function loadData() {
      loading.value = true
      const entity = ctx.root.$route.params.entity

      switch (entity) {
        case "creators":
          {
            const creators = await user.getCreators()
            items.value = creators
          }
          break
        case "nfts":
          {
            const nfts = await dashboard.getNfts()
            items.value = nfts
          }
          break
        default:
          break
      }

      loading.value = false
    }

    onMounted(() => loadData())
    watch(
      () => ctx.root.$route,
      () => loadData()
    )

    return { items, loading }
  },
})
</script>
