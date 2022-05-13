import Vue from "vue"
import Vuetify from "vuetify/lib/framework"

Vue.use(Vuetify)

export const vuetify = new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        primary: "#5656d6",
      },
    },
  },
})
