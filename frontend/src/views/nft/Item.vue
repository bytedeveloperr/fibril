<template>
  <v-row>
    <v-col md="6" cols="12">
      <v-img :src="item.value.metadata && item.value.metadata.image" />
    </v-col>

    <v-col md="6" cols="12">
      <p class="h1 font-weight-bold mb-5">
        {{ item.value.metadata && item.value.metadata.name }}
      </p>
      <div class="mb-6">
        <p class="h3 mb-1 font-weight-bold">Description</p>
        <p>{{ item.value.metadata && item.value.metadata.description }}</p>
      </div>

      <template
        v-if="
          item.value.metadata &&
          item.value.metadata.attributes &&
          Array.isArray(item.value.metadata.attributes)
        "
      >
        <p class="h3 mb-1 font-weight-bold">Properties</p>

        <ul class="style-none pa-0">
          <template v-for="(attribute, i) in item.value.metadata.attributes">
            <li
              :key="'attribute-' + i"
              class="d-flex justify-space-between pb-3"
            >
              <span>{{ attribute.trait_type }}</span>
              <span>{{ attribute.value }}</span>
            </li>
            <v-divider class="mb-3" :key="'divider-' + i" />
          </template>
        </ul>
      </template>
    </v-col>
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
