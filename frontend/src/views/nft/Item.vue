<template>
  <v-row>
    <v-col md="6" cols="12">
      <v-img :src="item.value.metadata && item.value.metadata.image" />
    </v-col>
    <v-col md="6" cols="12">
      <p class="h1">{{ item.value.metadata && item.value.metadata.name }}</p>
      <p class="">{{ item.value.metadata && item.value.metadata.description }}</p>
      <p class=""><strong>Owner:</strong> 0x7e4c...ace</p>
    </v-col>
  </v-row>
</template>

<style scoped>
.h1 {
  font-size: 30px;
}
</style>

<script>
import { defineComponent, onMounted, reactive } from "@vue/composition-api"
import { useDashboard } from "@/stores/dashboard"

export default defineComponent({
  setup(_, ctx) {
    const [address, id] = ctx.root.$route.params.id.split(":")
    const dashboard = useDashboard()
    const item = reactive({ value: {} })

    onMounted(async () => {
      item.value = await dashboard.getNftItem(address, id)
    })

    return { item }
  },
})
</script>
