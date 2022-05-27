<template>
  <v-row>
    <Loader v-if="loaders.mount" />

    <v-col v-else md="8" class="mx-auto">
      <div class="mb-0 d-flex justify-space-between">
        <h5 class="text-overline">Reward Supporters</h5>
        <v-btn text link @click="toggleCreateRewardModal" class="primary--text">create reward</v-btn>
      </div>
      <p class="mb-3">
        This will pick your supporters randomly and send them a specified amount of your token from your balances
      </p>

      <v-card flat outlined class="mt-3">
        <v-card-text>
          <Loader v-if="rewardStore.loading" />
          <Rewards :rewards="rewardStore.rewards" v-else />
        </v-card-text>
      </v-card>
    </v-col>

    <CreateRewardModal />
  </v-row>
</template>

<style scoped>
.h1 {
  font-size: 23px;
}
</style>

<script>
import Loader from "@/components/Loader"
import { config } from "@/config/config"
import { useUserStore } from "@/stores/user"
import { useRewardStore } from "@/stores/reward"
import Rewards from "@/components/lists/Rewards"
import { useToast } from "vue-toastification/composition"
import CreateRewardModal from "@/components/modals/CreateReward"
import { defineComponent, onMounted, provide, reactive, ref } from "@vue/composition-api"

export default defineComponent({
  components: { Loader, Rewards, CreateRewardModal },

  setup() {
    const toast = useToast()
    const userStore = useUserStore()
    const rewardStore = useRewardStore()
    const showCreateRewardModal = ref(null)
    const loaders = reactive({ submit: false, mount: false })
    const data = reactive({ amount: null, winners: null, asset: null })

    function toggleCreateRewardModal() {
      showCreateRewardModal.value = !showCreateRewardModal.value
    }
    provide("showCreateRewardModal", showCreateRewardModal)
    provide("toggleCreateRewardModal", toggleCreateRewardModal)

    onMounted(async () => {
      try {
        await rewardStore.loadRewards()

        console.log(JSON.parse(JSON.stringify(rewardStore.rewards)))
      } catch (e) {
        toast.error(e.message)
      }
    })

    return { userStore, rewardStore, config, data, toggleCreateRewardModal, loaders }
  },
})
</script>
