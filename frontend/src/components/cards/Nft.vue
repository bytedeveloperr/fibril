<template>
  <v-card flat outlined height="425">
    <router-link :to="`/nft/${item.address}:${item.tokenId}`">
      <v-img :src="(item.metadata && item.metadata.image) || '/assets/images/not-found.png'" height="300" />
    </router-link>

    <v-card-text class="pb-0">
      <div class="d-flex justify-space-between">
        <router-link :to="`/nft/${item.address}:${item.tokenId}`">
          <p class="h4 py-1 font-weight-bold">{{ item.metadata && item.metadata.name }}</p>
        </router-link>
      </div>

      <template
        v-if="(item.owner && item.owner.toLowerCase()) === (authStore.address && authStore.address.toLowerCase())"
      >
        <v-btn
          depressed
          block
          class="mb-5 primary--text"
          v-if="(item.sale && item.sale.status) != 'Active'"
          @click="toggleListingModal"
        >
          <v-icon>mdi-sale</v-icon> Sell Item
        </v-btn>
        <v-btn v-else depressed block :disabled="loaders.close" class="mb-5 primary--text" @click="closeNftListing">
          <v-icon>mdi-sale</v-icon> Close Sale
        </v-btn>
      </template>

      <template v-else>
        <template v-if="(item.sale && item.sale.status) === 'Active'">
          <v-btn
            depressed
            link
            block
            class="primary--text"
            :disabled="loaders.buy"
            v-if="authStore.authenticated"
            @click="buyNftItem"
          >
            Buy for {{ item.sale && item.sale.pricePerItem }} {{ item.sale && item.sale.paymentToken.symbol }}
          </v-btn>

          <template v-else>
            <v-btn
              depressed
              link
              block
              class="primary--text"
              :to="`/connect?next=/nft/${item.address}:${item.tokenId}`"
            >
              Connect wallet to buy
            </v-btn>
          </template>
        </template>

        <v-btn depressed block disabled class="primary--text" v-else>NFT is not for sale</v-btn>
      </template>
    </v-card-text>

    <ListNftModal :address="item.address" :tokenId="item.tokenId" />
  </v-card>
</template>

<script>
import { defineComponent, provide, reactive, ref } from "@vue/composition-api"
import ListNftModal from "@/components/modals/ListNft"
import NftListingList from "@/components/lists/NftListing"
import { useToast } from "vue-toastification/composition"

export default defineComponent({
  props: ["item", "authStore", "nftStore"],
  components: { ListNftModal, NftListingList },

  setup(props) {
    const { nftStore, item } = props
    const showListingModal = ref(null)
    const toast = useToast()
    const loaders = reactive({ mount: false, buy: false, close: false })

    async function closeNftListing() {
      loaders.close = true

      try {
        const data = { address: item.address, tokenId: item.tokenId }
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
          address: item.address,
          tokenId: item.tokenId,
          creator: item.creator.address,
          amount: item.sale.pricePerItem,
          paymentToken: item.sale.paymentToken,
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

    return { toggleListingModal, buyNftItem, showListingModal, closeNftListing, loaders }
  },
})
</script>

<style scoped>
.h4 {
  font-size: 16px;
}

.small-text {
  font-size: 12px;
}

a {
  color: inherit !important;
  text-decoration: none !important;
}

.v-btn--icon.v-size--default {
  width: unset;
  height: unset;
}
</style>
