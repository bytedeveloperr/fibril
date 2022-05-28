<template>
  <v-row>
    <v-col md="6" cols="12" class="mx-auto">
      <h4 class="text-overline">Account</h4>
      <Loader v-if="loaders.mount" />

      <template v-else>
        <v-tabs v-model="tab" class="mb-5">
          <v-tab class="font-weight-bold">General</v-tab>
          <v-tab class="font-weight-bold">Social Profiles</v-tab>
        </v-tabs>

        <template v-if="tab == 0">
          <p>Complete the form below to set or update your creator details</p>

          <div class="mb-5">
            <div class="d-flex mb-3">
              <v-avatar size="100">
                <v-img :src="userStore.data.avatar || '/assets/images/default.jpg'" />
              </v-avatar>
            </div>
            <div class="d-flex">
              <v-btn depressed rounded :disabled="loaders.upload">
                <label for="image">
                  <v-icon>mdi-upload-outline</v-icon> {{ loaders.upload ? "Uploading..." : "Choose Image" }}
                </label>
              </v-btn>
            </div>
            <input type="file" id="image" class="d-none" @change="handleFileUpload" />
          </div>

          <v-form @submit.prevent="handleFormSubmit" ref="form1">
            <v-text-field
              type="text"
              placeholder="Creator's Name"
              :value="userStore.name"
              v-model="userStore.data.name"
              :rules="rules"
            />
            <v-select
              placeholder="Category"
              :items="config.filters.creators"
              item-value="slug"
              item-text="title"
              :value="userStore.data.category"
              v-model="userStore.data.category"
              :rules="rules"
            />
            <v-text-field
              type="text"
              placeholder="Short Description"
              :value="userStore.data.shortDescription"
              v-model="userStore.data.shortDescription"
              :rules="rules"
            />
            <v-textarea
              placeholder="Long Description"
              :value="userStore.data.longDescription"
              v-model="userStore.data.longDescription"
            />
            <v-switch v-model="userStore.data.isPublished" inset label="Publish creator"></v-switch>

            <v-btn block depressed rounded :disabled="loaders.update" type="submit" class="primary mt-3">
              Save Details
            </v-btn>
          </v-form>
        </template>
        <template v-else>
          <p class="mb-0">Add your Social profile details</p>

          <v-form @submit.prevent="handleFormSubmit">
            <v-text-field
              type="text"
              placeholder="Facebook Profile URL"
              :value="userStore.facebook"
              v-model="userStore.data.facebook"
            >
              <v-img slot="prepend" height="30px" width="30px" src="/assets/images/facebook.svg" />
            </v-text-field>
            <v-text-field
              type="text"
              placeholder="Twitter Profile URL"
              :value="userStore.twitter"
              v-model="userStore.data.twitter"
            >
              <v-img slot="prepend" height="30px" width="30px" src="/assets/images/twitter.svg" />
            </v-text-field>
            <v-text-field
              type="text"
              placeholder="LinkedIn Profile URL"
              :value="userStore.linkedin"
              v-model="userStore.data.linkedin"
            >
              <v-img slot="prepend" height="30px" width="30px" src="/assets/images/linkedin.svg" />
            </v-text-field>
            <v-text-field
              type="text"
              placeholder="Youtube Channel URL"
              :value="userStore.youtube"
              v-model="userStore.data.youtube"
            >
              <v-img slot="prepend" height="30px" width="30px" src="/assets/images/youtube.svg" />
            </v-text-field>
            <v-text-field
              type="text"
              placeholder="Instagram Profile URL"
              :value="userStore.instagram"
              v-model="userStore.data.instagram"
            >
              <v-img slot="prepend" height="30px" width="30px" src="/assets/images/instagram.svg" />
            </v-text-field>
            <v-text-field
              type="text"
              placeholder="TikTok Profile URL"
              :value="userStore.tiktok"
              v-model="userStore.data.tiktok"
            >
              <v-img slot="prepend" height="30px" width="30px" src="/assets/images/tiktok.svg" />
            </v-text-field>

            <v-btn block depressed rounded :disabled="loaders.update" type="submit" class="primary mt-3">
              Save Details
            </v-btn>
          </v-form>
        </template>
      </template>
    </v-col>
  </v-row>
</template>

<style scoped>
.h4 {
  font-size: 23px;
}
</style>

<script>
import { defineComponent, onMounted, reactive, ref } from "@vue/composition-api"
import { useUserStore } from "@/stores/user"
import Loader from "@/components/Loader"
import { storage } from "@/helpers/storage"
import { useToast } from "vue-toastification/composition"
import { config } from "@/config/config"

export default defineComponent({
  components: { Loader },
  setup() {
    const tab = ref(null)
    const form1 = ref(null)
    const toast = useToast()
    const userStore = useUserStore()
    const rules = [(v) => !!v || "This field is required"]
    const loaders = reactive({ mount: false, upload: false, update: false })

    onMounted(async () => {
      loaders.mount = true
      try {
        await userStore.getUser()
      } catch (e) {
        toast.error(e.message)
      }
      loaders.mount = false
    })

    async function handleFormSubmit() {
      loaders.update = true

      try {
        if (!form1.value.validate()) return

        await userStore.updateUser()
        toast.success("Account details updated successfully")
      } catch (e) {
        toast.error(e.message)
      } finally {
        loaders.update = false
      }
    }

    async function handleFileUpload(e) {
      loaders.upload = true

      try {
        const file = e.target.files[0]
        if (file) {
          file.filename = "avatar"
          const cid = await storage.uploadFile(file)
          await userStore.updateAvatar(`https://ipfs.infura.io/ipfs/${cid}/${file.name}`)
          toast.success("Image uploaded successfully")
        }
      } catch (e) {
        toast.error(e.message)
      }

      loaders.upload = false
    }
    return { loaders, userStore, tab, config, handleFormSubmit, handleFileUpload, form1, rules }
  },
})
</script>
