import Vue from "vue"
import Vuetify from "vuetify/lib/framework"
import colors from "vuetify/lib/util/colors"

Vue.use(Vuetify)

export const vuetify = new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        primary: colors.indigo.accent4,
      },
    },
  },
})
