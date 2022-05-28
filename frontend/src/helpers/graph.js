import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

const fibrilUrl = "https://api.thegraph.com/subgraphs/name/bytedeveloperr/fibril"
const marketplaceUrl = "https://api.thegraph.com/subgraphs/name/bytedeveloperr/fibril-nft-utility"

const fibrilClient = new ApolloClient({ uri: fibrilUrl, cache: new InMemoryCache() })
const marketplaceClient = new ApolloClient({ uri: marketplaceUrl, cache: new InMemoryCache() })

const options = { fetchPolicy: "no-cache" }

export const graph = {
  async getDashboardData(address) {
    const query = gql`
      query GetCreatorData($address: Bytes!) {
        creators(where: { address: $address }) {
          id
          address
          tokenBalances {
            amount
            token
          }

          activities(first: 5) {
            id
            type
            from
            to
            token
            timestamp
            value
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options, variables: { address } })
    return data.data.creators[0] || { tokenBalances: [], activities: [] }
  },

  async getBalances(address) {
    const query = gql`
      query GetCreatorBalances($address: Bytes!) {
        creators(where: { address: $address }) {
          id
          address
          tokenBalances {
            amount
            token
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options, variables: { address } })
    return data.data.creators[0]?.tokenBalances || []
  },

  async getActivities(address) {
    const query = gql`
      query GetCreatorActivities($address: Bytes!) {
        creators(where: { address: $address }) {
          id
          address
          activities {
            id
            type
            from
            to
            token
            timestamp
            value
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options, variables: { address } })
    return data.data.creators[0]?.activities || []
  },

  async getSupporters(address) {
    const query = gql`
      query GetCreatorSupporters($address: Bytes!) {
        creators(where: { address: $address }) {
          id
          address
          supporters {
            id
            address
            supports {
              id
              amount
              token
            }
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options, variables: { address } })
    return data.data.creators[0]?.supporters || []
  },

  async getSupporter(id) {
    const query = gql`
      query GetSupporter($id: Bytes!) {
        supporters(where: { id: $id }) {
          id
          address
          creator {
            id
            address
          }
          supports {
            id
            amount
            token
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options, variables: { id } })
    return data.data.supporters[0]
  },

  async getNfts() {
    const query = gql`
      {
        nftItems {
          id
          address
          tokenId
          paymentToken
          isSold
          owner
          creator {
            address
          }
        }
      }
    `

    const data = await fibrilClient.query({ query })
    return data.data.nftItems
  },

  async getCreatorNfts(address) {
    const ntfs = await this.getNfts()
    return ntfs.filter((nft) => nft.creator.address.toLowerCase() == address.toLowerCase())
  },

  async getNftItem(address, tokenId) {
    const query = gql`
      query GetNftItem($address: Bytes!, $id: BigInt!) {
        nftItems(where: { address: $address, tokenId: $id }) {
          id
          address
          tokenId
          paymentToken
          isSold
          owner
          creator {
            address
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options, variables: { address, id: tokenId } })
    return data.data.nftItems[0]
  },

  async getNftListings(address, tokenId) {
    const query = gql`
      query GetNftListings($address: Bytes!, $tokenId: BigInt!) {
        listings(where: { address: $address, tokenId: $tokenId }) {
          id
          address
          paymentToken
          listedBy
          listedAt
          pricePerItem
          tokenId
          status
        }
      }
    `

    const data = await marketplaceClient.query({ query, ...options, variables: { address, tokenId } })
    return data.data.listings
  },

  async getCreatorRewards(address) {
    const query = gql`
      query GetCreatorRewards {
        rewards {
          id
          amountPerWinner
          winnersCount
          token
          winners
          status
          timestamp
          creator {
            address
          }
        }
      }
    `

    const data = await fibrilClient.query({ query, ...options })
    return (data.data.rewards || []).filter((a) => a.creator.address.toLowerCase() === address.toLowerCase())
  },
}
