<template>
  <v-row>
    <Loader v-if="nftStore.loading" />
    <template v-else>
      <v-col md="6" cols="12">
        <v-img :src="nftStore.nft.metadata && nftStore.nft.metadata.image" />
      </v-col>

      <v-col md="6" cols="12">
        <div class="d-flex justify-space-between">
          <p class="h1 font-weight-bold mb-5">{{ nftStore.nft.metadata && nftStore.nft.metadata.name }}</p>
          <template
            v-if="
              (nftStore.nft.owner && nftStore.nft.owner.toLowerCase()) ===
              (authStore.address && authStore.address.toLowerCase())
            "
          >
            <v-btn
              depressed
              class="mb-5 primary--text"
              v-if="(nftStore.nft.sale && nftStore.nft.sale.status) != 'Active'"
              @click="toggleListingModal"
            >
              <v-icon>mdi-sale</v-icon> Sell Item
            </v-btn>
            <v-btn v-else depressed :disabled="loaders.close" class="mb-5 primary--text" @click="closeNftListing">
              <v-icon>mdi-sale</v-icon> Close Sale
            </v-btn>
          </template>
          <template v-else>
            <v-btn
              depressed
              disabled
              class="mb-5 primary--text"
              v-if="!nftStore.nft.sale || (nftStore.nft.sale && nftStore.nft.sale.status) !== 'Active'"
            >
              Not for sale
            </v-btn>
            <v-btn v-else depressed :disabled="loaders.buy" class="mb-5 primary--text" @click="buyNftItem">
              Buy for {{ nftStore.nft.sale && nftStore.nft.sale.pricePerItem }}
              {{ nftStore.nft.sale && nftStore.nft.sale.paymentToken && nftStore.nft.sale.paymentToken.symbol }}
            </v-btn>
          </template>
        </div>

        <div class="mb-6">
          <p class="h3 mb-1 font-weight-bold">Description</p>
          <p class="text--secondary text-small">{{ nftStore.nft.metadata && nftStore.nft.metadata.description }}</p>
        </div>

        <template>
          <v-tabs v-model="tab" class="mb-3">
            <v-tab class="font-weight-bold">Attributes</v-tab>
            <v-tab class="font-weight-bold">Listing History</v-tab>
            <v-tab class="font-weight-bold">Info</v-tab>
          </v-tabs>

          <template v-if="tab === 0">
            <template
              v-if="
                nftStore.nft.metadata &&
                nftStore.nft.metadata.attributes &&
                Array.isArray(nftStore.nft.metadata.attributes)
              "
            >
              <ul class="style-none pa-0">
                <template v-for="(attribute, i) in nftStore.nft.metadata.attributes">
                  <li :key="'attribute-' + i" class="d-flex justify-space-between pb-3">
                    <span>{{ attribute.trait_type }}</span>
                    <span>{{ attribute.value }}</span>
                  </li>
                  <v-divider class="mb-3" :key="'divider-' + i" />
                </template>
              </ul>
            </template>
            <Empty text="This Item does not have attributes" v-else />
          </template>
          <template v-if="tab === 1">
            <Empty text="No listing history" v-if="nftStore.nft.listings.length < 1" />
            <NftListingList v-else :listings="nftStore.nft.listings" />
          </template>
          <template v-if="tab === 2">
            <ul class="style-none pa-0">
              <li class="d-flex justify-space-between">
                <span>Contract Address:</span>
                <v-btn
                  text
                  link
                  class="primary--text"
                  target="_blank"
                  :href="`${environment.explorerUrl}/token/${nftStore.nft.address}`"
                >
                  {{ util.truncateEthAddress(nftStore.nft.address) }}
                </v-btn>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between mb-3">
                <span>Token ID:</span>
                <span class="pe-5">{{ nftStore.nft.tokenId }}</span>
              </li>
              <v-divider class="mb-3" />

              <li class="d-flex justify-space-between">
                <span>Owner:</span>
                <v-btn
                  text
                  link
                  class="primary--text"
                  target="_blank"
                  :href="`${environment.explorerUrl}/address/${nftStore.nft.owner}`"
                >
                  {{ util.truncateEthAddress(nftStore.nft.owner) }}
                </v-btn>
              </li>
              <v-divider class="mb-3" />
            </ul>
          </template>
        </template>
      </v-col>

      <ListNftModal :address="nftStore.nft.address" :tokenId="nftStore.nft.tokenId" />
    </template>
  </v-row>
</template>

<style scoped>
.h1 {
  font-size: 30px;
}
.h3 {
  font-size: 17px;
}
.style-none {
  list-style: none;
}
</style>

<script>
import { defineComponent, onMounted, provide, reactive, ref } from "@vue/composition-api"
import { useNftStore } from "@/stores/nft"
import { useAuthStore } from "@/stores/auth"
import { util } from "@/helpers/util"
import Empty from "@/components/Empty"
import Loader from "@/components/Loader"
import ListNftModal from "@/components/modals/ListNft"
import NftListingList from "@/components/lists/NftListing"
import { useToast } from "vue-toastification/composition"
import { environment } from "@/config/environment"

export default defineComponent({
  components: { ListNftModal, NftListingList, Empty, Loader },
  setup(_, ctx) {
    const tab = ref(null)
    const toast = useToast()
    const nftStore = useNftStore()
    const authStore = useAuthStore()
    const showListingModal = ref(null)
    const loaders = reactive({ buy: false, close: false })
    const [address, id] = ctx.root.$route.params.id.split(":")

    async function closeNftListing() {
      loaders.close = true

      try {
        const data = { address: nftStore.nft.address, tokenId: nftStore.nft.tokenId }
        await nftStore.closeNftListing(data)
        toast.success("Listing closed successfully")
      } catch (e) {
        toast.error(e.data?.message || e.message)
      }

      loaders.close = false
    }

    async function buyNftItem() {
      loaders.buy = true

      try {
        const data = {
          address: nftStore.nft.address,
          tokenId: nftStore.nft.tokenId,
          creator: nftStore.nft.creator.address,
          amount: nftStore.nft.sale.pricePerItem,
          paymentToken: nftStore.nft.sale.paymentToken,
        }

        await nftStore.buyNftItem(data)
        toast.success("Item successfully bought")
      } catch (e) {
        toast.error(e.data?.message || e.message)
      }

      loaders.buy = false
    }

    function toggleListingModal() {
      showListingModal.value = !showListingModal.value
    }

    provide("showListingModal", showListingModal)
    provide("toggleListingModal", toggleListingModal)

    onMounted(async () => {
      try {
        await nftStore.loadNftItem(address, id)
      } catch (e) {
        toast.error(e.message)
      }
    })

    return {
      tab,
      util,
      loaders,
      buyNftItem,
      closeNftListing,
      showListingModal,
      toggleListingModal,
      authStore,
      nftStore,
      environment,
    }
  },
})
</script>
