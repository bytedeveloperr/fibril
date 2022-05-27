import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ZERO_ADDRESS } from "@protofire/subgraph-toolkit"
import {
  Fibril,
  Withdraw,
  Support,
  CreatorCreated,
  NftSold,
  RewardCreated,
  RewardUpdated,
} from "../generated/Fibril/Fibril"
import { TokenBalance, Creator, Supporter, Activity, NftItem, SupportAmount, Reward } from "../generated/schema"

export function handleCreator(event: CreatorCreated): void {
  let creator = Creator.load(event.params.id.toString())

  if (!creator) {
    creator = new Creator(event.params.id.toString())
    creator.address = event.params.account
    creator.save()
  }
}

export function handleSupport(event: Support): void {
  const fibril = Fibril.bind(event.address)
  const supporterId = event.params.creator.concat(event.params.supporter)
  const creator = fibril.getCreator(event.params.creator)

  const activity = new Activity(event.transaction.hash)
  activity.from = event.params.supporter
  activity.to = event.params.creator
  activity.value = event.params.amount
  activity.type = "Support"
  activity.token = event.params.token
  activity.method = event.params.tokenType
  activity.timestamp = event.block.timestamp
  activity.creator = creator.id.toString()
  activity.save()

  let supporter = Supporter.load(supporterId)
  if (!supporter) {
    supporter = new Supporter(supporterId)
    supporter.creator = creator.id.toString()
    supporter.address = event.params.supporter

    supporter.save()
  }

  if (event.params.tokenType == "ERC20") {
    const balanceId = event.params.creator.concat(event.params.token)
    let balance = TokenBalance.load(balanceId)
    if (!balance) {
      balance = new TokenBalance(balanceId)
      balance.token = event.params.token
      balance.amount = BigInt.fromI32(0)
      balance.creator = creator.id.toString()
    }

    balance.amount = balance.amount.plus(event.params.amount)
    balance.save()

    const supportAmountId = event.params.creator.concat(event.params.supporter).concat(event.params.token)
    let supportAmount = SupportAmount.load(supportAmountId)
    if (!supportAmount) {
      supportAmount = new SupportAmount(supportAmountId)
      supportAmount.supporter = supporterId
      supportAmount.token = event.params.token
      supportAmount.amount = BigInt.fromI32(0)
      supportAmount.creator = creator.id.toString()
    }

    supportAmount.amount = supportAmount.amount.plus(event.params.amount)
    supportAmount.save()
  } else {
    const nftId = event.params.creator
      .concat(event.params.token)
      .concat(changetype<Bytes>(Bytes.fromBigInt(event.params.tokenId)))
    let nft = NftItem.load(nftId)

    if (!nft) {
      nft = new NftItem(nftId)
    }

    nft.address = event.params.token
    nft.tokenId = event.params.tokenId
    nft.creator = creator.id.toString()
    nft.paymentToken = Bytes.fromHexString(ZERO_ADDRESS)
    nft.owner = event.params.creator
    nft.isSold = false
    nft.save()
  }
}

export function handleWithdraw(event: Withdraw): void {
  const fibril = Fibril.bind(event.address)
  const balanceId = event.params.creator.concat(event.params.token)
  const creator = fibril.getCreator(event.params.creator)

  const activity = new Activity(event.transaction.hash)
  activity.from = event.params.creator
  activity.to = event.params.recipient
  activity.value = event.params.amount
  activity.type = "Withdraw"
  activity.token = event.params.token
  activity.timestamp = event.block.timestamp
  activity.creator = creator.id.toString()
  activity.save()

  if (event.params.tokenType == "ERC20") {
    let balance = TokenBalance.load(balanceId)
    if (balance) {
      balance.amount = balance.amount.minus(event.params.amount)
      balance.save()
    }
  }
}

export function handleNftSale(event: NftSold): void {
  const nftId = event.params.creator
    .concat(event.params.nftAddress)
    .concat(changetype<Bytes>(Bytes.fromBigInt(event.params.tokenId)))

  let nft = NftItem.load(nftId)

  if (nft) {
    nft.owner = event.params.buyer
    nft.isSold = true
    nft.save()
  }
}

export function handleRewardCreated(event: RewardCreated): void {
  const fibril = Fibril.bind(event.address)
  const creator = fibril.getCreator(event.params.creator)

  const reward = new Reward(event.params.requestId.toString())
  reward.creator = creator.id.toString()
  reward.amountPerWinner = event.params.amountPerWinner
  reward.winnersCount = event.params.winnersCount
  reward.token = event.params.token
  reward.status = "Initiated"
  reward.timestamp = event.block.timestamp

  reward.save()
}

export function handleRewardUpdated(event: RewardUpdated): void {
  const reward = Reward.load(event.params.requestId.toString())
  if (reward) {
    reward.status = event.params.status
    reward.winners = changetype<Bytes[]>(event.params.winners)
    reward.save()
  }
}
