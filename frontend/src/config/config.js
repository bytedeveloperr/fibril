import { environment } from "./environment"

export const config = {
  tokens: [environment.nativeTokenAddress, environment.daiTokenAddress, environment.usdtTokenAddress, environment.usdcTokenAddress],
  token: {
    DAI: environment.daiTokenAddress,
    USDC: environment.usdcTokenAddress,
    USDT: environment.usdtTokenAddress,
    MATIC: environment.nativeTokenAddress,
  },
}
