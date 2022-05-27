<template>
  <v-container>
    <Loader v-if="linkStore.loading" />

    <template v-else>
      <p class="text-center mb-10 app-text-logo" style="font-size: 30px">Fibril</p>

      <v-row align="center" justify="center">
        <v-col cols="12" md="6">
          <v-card flat outlined>
            <v-card-text class="py-10">
              <div class="text-center">
                <p class="h2 font-weight-bold">{{ linkStore.link.title }}</p>
                <p class="text--secondary text-small">{{ linkStore.link.description }}</p>
              </div>

              <v-divider class="my-3" />

              <div class="my-5 text-center">
                <p class="mb-2">You are about to support {{ userStore.data.name }} with</p>
                <p class="h1 mt-2">
                  {{ linkStore.link.amount }} {{ linkStore.link.token && linkStore.link.token.symbol }}
                </p>
              </div>

              <v-btn depressed block v-if="!authStore.address" :to="`/connect?next=${$route.path}`" class="primary">
                Connect Wallet
              </v-btn>
              <v-btn v-else depressed block class="primary" :disabled="loaders.submit" @click="supportCreator">
                Continue
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.h3 {
  font-size: 18px;
}

.h2 {
  font-size: 20px;
}

.h1 {
  font-size: 23px;
}
</style>

<script>
import { defineComponent, onMounted, reactive } from "@vue/composition-api"
import { useAuthStore } from "@/stores/auth"
import { useUserStore } from "@/stores/user"
import { useLinkStore } from "@/stores/link"
import { useToast } from "vue-toastification/composition"
import Loader from "@/components/Loader"

export default defineComponent({
  components: { Loader },
  setup(_, ctx) {
    const { $route, $router } = ctx.root
    const toast = useToast()
    const authStore = useAuthStore()
    const userStore = useUserStore()
    const linkStore = useLinkStore()
    const loaders = reactive({ submit: false })

    onMounted(async () => {
      try {
        await linkStore.loadSupportLink($route.params.cid)
        await userStore.getUser(linkStore.link.creator)
      } catch (e) {
        toast.error(e.message)
      }
    })

    async function supportCreator() {
      loaders.submit = true
      try {
        await userStore.supportCreator({
          method: "Token",
          amount: linkStore.link.amount,
          asset: linkStore.link.token,
          creator: linkStore.link.creator,
          supporter: authStore.address,
        })

        toast.success("Creator supported successfully")
        if (linkStore.link.redirectTo) {
          window.location.href = linkStore.link.redirectTo
        } else {
          $router.push(`/creator/${linkStore.link.creator}`)
        }
      } catch (e) {
        toast.error(e.message)
      }
      loaders.submit = false
    }

    return { authStore, userStore, linkStore, supportCreator, loaders }
  },
})
</script>
