import { ApolloClient, InMemoryCache, gql } from "@apollo/client"

const url = "https://api.thegraph.com/subgraphs/name/bytedeveloperr/fibril"
const client = new ApolloClient({ uri: url, cache: new InMemoryCache() })

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

    const data = await client.query({ query: query, variables: { address } })
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

    const data = await client.query({ query: query, variables: { address } })
    return data.data.creators[0]?.tokenBalances || []
  },

  async getActivities(address) {
    const query = gql`
      query GetCreatorActivities($address: Bytes!) {
        creators(where: { address: $address }) {
          id
          address
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

    const data = await client.query({ query: query, variables: { address } })
    return data.data.creators[0]?.activities || []
  },

  async getNfts() {
    const query = gql`
      {
        nftItems {
          id
          address
          tokenId
          seller
          paymentToken
          isListed
          price
          creator {
            address
          }
        }
      }
    `

    const data = await client.query({ query: query })
    return data.data.nftItems
  },

  async getNftItem(address, tokenId) {
    const query = gql`
      query GetNftItem($address: Bytes!, $id: BigInt!) {
        nftItems(where: { address: $address, tokenId: $id }) {
          id
          address
          tokenId
          seller
          paymentToken
          isListed
          price
          creator {
            address
          }
        }
      }
    `

    const data = await client.query({ query: query, variables: { address, id: tokenId } })
    return data.data.nftItems[0]
  },
}
