import { environment } from "./environment"

export const config = {
  appName: "Fibril",
  methods: ["NFT", "Token"],
  tokens: [
    {
      address: environment.nullAddress,
      name: "Matic Token",
      symbol: "MATIC",
      decimals: "18",
      logo: "/assets/images/matic.svg",
    },
    {
      address: environment.daiTokenAddress,
      name: "DAI Token",
      symbol: "DAI",
      decimals: "18",
      logo: "/assets/images/dai.svg",
    },
    {
      address: environment.usdtTokenAddress,
      name: "Tether USD",
      symbol: "USDT",
      decimals: "6",
      logo: "/assets/images/usdt.svg",
    },
    {
      address: environment.usdcTokenAddress,
      name: "USD Coin",
      symbol: "USDC",
      decimals: "6",
      logo: "/assets/images/usdc.svg",
    },
  ],
  filters: {
    creators: [
      { title: "Software", slug: "software" },
      { title: "Music", slug: "music" },
      { title: "Podcasts", slug: "podcasts" },
      { title: "Gaming", slug: "gaming" },
      { title: "Art", slug: "art" },
      { title: "Non Profit", slug: "non-profit" },
      { title: "Education", slug: "education" },
      { title: "Content Writing", slug: "writing" },
      { title: "Video Creation", slug: "video" },
      { title: "Others", slug: "others" },
    ],

    nfts: [
      { title: "For Sale", slug: "for-sale" },
      { title: "Not For Sale", slug: "not-for-sale" },
    ],
  },
}
