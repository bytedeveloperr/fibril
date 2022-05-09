import Moralis from "moralis"
import { environment } from "../config/environment"

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
}
