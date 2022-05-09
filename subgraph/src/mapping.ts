import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import { ZERO_ADDRESS } from "@protofire/subgraph-toolkit"
import { Fibril, Withdraw, Support, Creator as CreatorCreated } from "../generated/Fibril/Fibril"
import { TokenBalance, Creator, Supporter, Activity, NftItem } from "../generated/schema"

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
  const creatorId = fibril.getCreatorId(event.params.creator)

  const activity = new Activity(event.transaction.hash)
  activity.from = event.params.supporter
  activity.to = event.params.creator
  activity.value = event.params.amount
  activity.type = "Support"
  activity.token = event.params.token
  activity.method = event.params.tokenType
  activity.timestamp = event.block.timestamp
  activity.creator = creatorId.toString()
  activity.save()

  let supporter = Supporter.load(supporterId)
  if (!supporter) {
    supporter = new Supporter(supporterId)
    supporter.creator = creatorId.toString()
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
      balance.creator = creatorId.toString()
    }

    balance.amount = balance.amount.plus(event.params.amount)
    balance.save()
  } else {
    const nftId = event.params.creator.concat(event.params.token).concat(changetype<Bytes>(Bytes.fromBigInt(event.params.tokenId)))
    let nft = NftItem.load(nftId)

    if (!nft) {
      nft = new NftItem(nftId)
    }

    nft.address = event.params.token
    nft.tokenId = event.params.tokenId
    nft.creator = creatorId.toString()
    nft.price = BigInt.fromI32(0)
    nft.paymentToken = Bytes.fromHexString(ZERO_ADDRESS)
    nft.seller = Bytes.fromHexString(ZERO_ADDRESS)
    nft.isListed = false
    nft.save()
  }
}

export function handleWithdraw(event: Withdraw): void {
  const fibril = Fibril.bind(event.address)
  const balanceId = event.params.creator.concat(event.params.token)
  const creatorId = fibril.getCreatorId(event.params.creator)

  const activity = new Activity(event.transaction.hash)
  activity.from = event.params.creator
  activity.to = event.params.recipient
  activity.value = event.params.amount
  activity.type = "Withdraw"
  activity.token = event.params.token
  activity.timestamp = event.block.timestamp
  activity.creator = creatorId.toString()
  activity.save()

  if (event.params.tokenType == "ERC20") {
    let balance = TokenBalance.load(balanceId)
    if (balance) {
      balance.amount = balance.amount.minus(event.params.amount)
      balance.save()
    }
  }
}
