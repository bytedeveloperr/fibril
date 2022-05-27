<template>
  <div>
    <h5 class="text-overline mb-5">Discover {{ $route.params.entity }}</h5>

    <v-row>
      <v-col md="6" cols="12" class="my-0 py-0">
        <v-text-field placeholder="Search..." v-model="input.text" outlined dense />
      </v-col>
      <v-col md="6" cols="12" class="my-0 py-0">
        <v-select
          dense
          outlined
          item-value="slug"
          item-text="title"
          v-model="input.category"
          :items="config.filters[$route.params.entity]"
          :placeholder="`Filter ${$route.params.entity} ${$route.params.entity === 'creators' ? 'by categories' : ''}`"
        ></v-select>
      </v-col>
    </v-row>

    <v-row>
      <Loader v-if="loaders.mount" />
      <template v-else>
        <Empty v-if="items.value.length < 1" />

        <v-col v-else v-for="(item, i) in items.value" :key="'c-' + i" md="3">
          <Creator v-if="$route.params.entity === 'creators'" :item="item" />
          <Nft v-else-if="$route.params.entity === 'nfts'" :authStore="authStore" :nftStore="nftStore" :item="item" />
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, watch } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Empty from "@/components/Empty"
import Creator from "@/components/cards/Creator"
import Supporter from "@/components/cards/Supporter"
import Nft from "@/components/cards/Nft"
import { useUserStore } from "@/stores/user"
import { useAuthStore } from "@/stores/auth"
import { useDashboardStore } from "@/stores/dashboard"
import { useNftStore } from "@/stores/nft"
import { useToast } from "vue-toastification/composition"
import { config } from "@/config/config"

export default defineComponent({
  components: { Creator, Supporter, Nft, Loader, Empty },
  setup(_, ctx) {
    const nftStore = useNftStore()
    const userStore = useUserStore()
    const authStore = useAuthStore()
    const dashboardStore = useDashboardStore()
    const toast = useToast()
    const loaders = reactive({ mount: false })
    const input = reactive({ category: null, text: null })
    const items = reactive({ value: [] })

    async function loadData() {
      loaders.mount = true
      const entity = ctx.root.$route.params.entity
      try {
        switch (entity) {
          case "creators":
            {
              const creators = await userStore.getCreators()
              items.value = creators
              input.category = null
              input.text = null

              watch(
                () => input.category,
                (n) => {
                  if (n) {
                    items.value = creators.filter((i) => i.category === n)
                  } else {
                    items.value = creators
                  }
                }
              )

              watch(
                () => input.text,
                (n) => {
                  if (n) {
                    n = n.toLowerCase()
                    items.value = creators.filter(
                      (i) =>
                        i.name.toLowerCase().includes(n) ||
                        i.longDescription.toLowerCase().includes(n) ||
                        i.shortDescription.toLowerCase().includes(n) ||
                        i.category.toLowerCase().includes(n)
                    )
                  } else {
                    items.value = creators
                  }
                }
              )
            }
            break
          case "nfts":
            {
              await nftStore.loadNfts()
              items.value = nftStore.nfts
              input.category = null
              input.text = null

              watch(
                () => input.category,
                (n) => {
                  if (n) {
                    items.value = nftStore.nfts.filter((i) =>
                      n === "for-sale" ? i.sale && i.sale.status == "Active" : i.sale && i.sale.status !== "Active"
                    )
                  } else {
                    items.value = nftStore.nfts
                  }
                }
              )

              watch(
                () => input.text,
                (n) => {
                  if (n) {
                    n = n.toLowerCase()
                    items.value = nftStore.nfts.filter(
                      (i) =>
                        i.metadata.name.toLowerCase().includes(n) || i.metadata.description.toLowerCase().includes(n)
                    )
                  } else {
                    items.value = nftStore.nfts
                  }
                }
              )
            }
            break
        }
      } catch (e) {
        toast.error(e.message)
      }

      loaders.mount = false
    }

    onMounted(() => loadData())
    watch(
      () => ctx.root.$route,
      () => loadData()
    )

    return { authStore, nftStore, items, loaders, dashboardStore, config, input }
  },
})
</script>
