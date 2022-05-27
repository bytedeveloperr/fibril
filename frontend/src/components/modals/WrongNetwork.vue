<template>
  <div v-if="!!authStore.chainId ? authStore.chainId != Number(environment.chainId) : false">
    <v-dialog persistent v-model="show" max-width="500">
      <v-card class="pt-6 text-center">
        <v-card-text>
          <v-img
            src="/assets/images/wrong-network.png"
            alt="Wrong Network"
            class="mx-auto d-block mb-3"
            width="50px"
            height="50px"
          />

          <p class="">You're connected to the wrong network Fren!. Switch to Polygon Mumbai to continue</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.h1 {
  font-size: 20px;
}
</style>

<script>
import { defineComponent } from "@vue/composition-api"
import { useAuthStore } from "@/stores/auth"
import { environment } from "@/config/environment"

export default defineComponent({
  setup() {
    const authStore = useAuthStore()
    const show = true

    return { show, environment, authStore }
  },
})
</script>
