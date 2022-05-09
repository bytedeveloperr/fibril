<template>
  <v-row>
    <v-col md="6" cols="12" class="mx-auto">
      <div class="mb-5">
        <h4 class="text-overline">Account</h4>
        <p>Hi fren 👋. Complete the form below to set or update your creator details</p>
      </div>
      <Loader v-if="user.loading" />
      <template v-else>
        <div class="mb-5">
          <div class="d-flex mb-3">
            <v-avatar size="100">
              <v-img :src="user.data.avatar || '/assets/images/default.jpg'" />
            </v-avatar>
          </div>
          <div class="d-flex">
            <v-btn depressed rounded :disabled="uploading">
              <label for="image"> <v-icon>mdi-upload-outline</v-icon> {{ uploading ? "Uploading..." : "Choose Image" }} </label>
            </v-btn>
          </div>
          <input type="file" id="image" class="d-none" @change="handleFileUpload" />
        </div>

        <v-form @submit.prevent="handleFormSubmit">
          <v-text-field type="text" placeholder="Creator's Name" :value="user.name" v-model="user.data.name" />
          <v-select placeholder="Category" :items="categories" :value="user.data.category" v-model="user.data.category" />
          <v-text-field type="text" placeholder="Short Description" :value="user.data.shortDescription" v-model="user.data.shortDescription" />
          <v-textarea placeholder="Long Description" :value="user.data.longDescription" v-model="user.data.longDescription" />
          <v-switch v-model="user.data.isPublished" inset label="Publish creator"></v-switch>

          <v-btn block depressed rounded type="submit" class="primary mt-3">Save Details</v-btn>
        </v-form>
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
import { defineComponent, onMounted, ref } from "@vue/composition-api"
import { useUser } from "@/stores/user"
import Loader from "@/components/Loader"
import { storage } from "@/helpers/storage"

export default defineComponent({
  components: { Loader },
  setup() {
    const user = useUser()
    const uploading = ref(null)
    const categories = ["Software", "Podcast"]

    onMounted(async () => {
      await user.getUser()
    })

    async function handleFormSubmit() {
      await user.updateUser()
    }

    async function handleFileUpload(e) {
      uploading.value = true

      const file = e.target.files[0]
      if (file) {
        file.filename = "avatar"
        const cid = await storage.uploadFile(file)
        await user.updateAvatar(`https://ipfs.infura.io/ipfs/${cid}/${file.name}`)
      }

      uploading.value = false
    }
    return { uploading, user, categories, handleFormSubmit, handleFileUpload }
  },
})
</script>
