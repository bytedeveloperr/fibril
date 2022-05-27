<template>
  <div>
    <h5 class="text-overline mb-5">Your NFTs</h5>

    <v-row>
      <v-col md="6" cols="12" class="my-0 py-0 mx-auto">
        <v-text-field placeholder="Search..." outlined dense v-model="input.text" />
      </v-col>
    </v-row>

    <v-row>
      <Loader v-if="loaders.mount" />
      <template v-else>
        <Empty v-if="items.value.length < 1" text="No NFT Items found" />

        <v-col v-else v-for="(item, i) in items.value" :key="'c-' + i" md="3">
          <Nft :authStore="authStore" :nftStore="nftStore" :item="item" />
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script>
import { defineComponent, onMounted, reactive, watch } from "@vue/composition-api"
import Loader from "@/components/Loader"
import Empty from "@/components/Empty"
import Supporter from "@/components/cards/Supporter"
import Nft from "@/components/cards/Nft"
import { useAuthStore } from "@/stores/auth"
import { useNftStore } from "@/stores/nft"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  components: { Supporter, Nft, Loader, Empty },
  setup() {
    const toast = useToast()
    const nftStore = useNftStore()
    const authStore = useAuthStore()
    const input = reactive({ text: null })
    const loaders = reactive({ mount: false })
    const items = reactive({ value: [] })

    onMounted(async () => {
      loaders.mount = true
      try {
        await nftStore.loadNfts(authStore.address)
        items.value = nftStore.nfts
      } catch (e) {
        toast.error(e.message)
      }
      loaders.mount = false
    })

    watch(
      () => input.text,
      (n) => {
        if (n) {
          n = n.toLowerCase()
          items.value = nftStore.nfts.filter(
            (i) => i.metadata.name.toLowerCase().includes(n) || i.metadata.description.toLowerCase().includes(n)
          )
        } else {
          items.value = nftStore.nfts
        }
      }
    )

    return { items, input, loaders, authStore, nftStore }
  },
})
</script>
