import Moralis from "moralis"
import blockies from "ethereum-blockies"
import { environment } from "../config/environment"
import dayjs from "dayjs"

export const util = {
  truncateEthAddress(address) {
    if (!address) return address

    const regex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
    const match = address.match(regex)
    if (!match) return address

    return `${match[1]}…${match[2]}`
  },

  isNullAddress(address) {
    if (!address) return
    return address.toLowerCase() === environment.nullAddress.toLowerCase()
  },

  isEthAddress(address) {
    return Moralis.web3Library.utils.isAddress(address)
  },

  generateBlocky(address) {
    return blockies.create({ seed: address }).toDataURL()
  },

  formatDate(date) {
    return dayjs(date).format("MMMM DD, YYYY h:mm A")
  },

  async copyToClipboard(text) {
    const permission = await navigator.permissions.query({ name: "clipboard-write" })
    if (permission.state == "granted" || permission.state == "prompt") {
      await navigator.clipboard.writeText(text)
    }
  },

  parseIpfsUrl(url, gateway = "https://ipfs.infura.io") {
    if (!url) return
    if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", `${gateway}/ipfs/`)
    }
  },
}
