import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js"
import { environment } from "../config/environment"

const web3StorageClient = new Web3Storage({ token: environment.web3StorageToken })

export const storage = {
  get client() {
    return web3StorageClient
  },

  async uploadFile(file) {
    return await this.client.put([file])
  },

  async getFile(cid) {
    return await this.client.get(cid)
  },
}
