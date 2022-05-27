<template>
  <div>
    <Empty v-if="activities.length < 1" text="No activities yet" />
    <v-list v-else two-line class="pt-0">
      <template v-for="(activity, i) in activities">
        <v-list-item link :key="'activity' + i" @click="toggleModal(activity)">
          <v-list-item-avatar v-if="activity.type == 'Support'" color="green lighten-4">
            <v-icon>mdi-arrow-bottom-right</v-icon>
          </v-list-item-avatar>
          <v-list-item-avatar v-else color="red lighten-4">
            <v-icon>mdi-arrow-top-left</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title class="mb-2">{{ activity.type }}</v-list-item-title>
            <v-list-item-subtitle>{{ util.formatDate(Number(activity.timestamp) * 1000) }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-title class="mb-2">{{ activity.value }} {{ activity.asset.symbol }}</v-list-item-title>
          </v-list-item-action>
        </v-list-item>
        <v-divider :key="'divider-' + i" v-if="i != activities.length - 1" />
      </template>
    </v-list>

    <Activity :activity="activity" />
  </div>
</template>

<script>
import { defineComponent, provide, reactive, ref } from "@vue/composition-api"
import Empty from "@/components/Empty"
import Activity from "@/components/modals/Activity"
import { useAuthStore } from "@/stores/auth"
import { util } from "@/helpers/util"

export default defineComponent({
  props: ["activities"],
  components: { Activity, Empty },
  setup() {
    const authStore = useAuthStore()
    const showModal = ref(null)
    const activity = reactive({})

    function toggleModal(act) {
      Object.assign(activity, act)
      showModal.value = !showModal.value
    }
    provide("showModal", showModal)
    provide("toggleModal", toggleModal)

    return { authStore, showModal, toggleModal, activity, util }
  },
})
</script>
