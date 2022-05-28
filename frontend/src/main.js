import Vue from "vue"
import CompositionApi from "@vue/composition-api"
import { createPinia, PiniaVuePlugin } from "pinia"
import Toast from "vue-toastification"
import { router } from "./router"
import { vuetify } from "./plugins/vuetify"
import { moralis } from "./helpers/moralis"
import App from "./App.vue"

import "./main.css"
import "vue-toastification/dist/index.css"

Vue.config.productionTip = false

Vue.use(CompositionApi)
Vue.use(PiniaVuePlugin)
Vue.use(Toast, {})

const pinia = createPinia()
moralis.initialize()

const app = new Vue({ pinia, router: router(), vuetify, render: (h) => h(App) })

app.$mount("#app")
