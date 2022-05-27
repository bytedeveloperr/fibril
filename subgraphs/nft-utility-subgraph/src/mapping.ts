import { Listed, ListingClosed } from "../generated/Utility/Utility"
import { Listing } from "../generated/schema"

export function handleListed(event: Listed): void {
  let listing = Listing.load(event.params.listingId.toString())

  if (!listing) {
    listing = new Listing(event.params.listingId.toString())
    listing.address = event.params.nftAddress
    listing.paymentToken = event.params.paymentToken
    listing.listedBy = event.params.listedBy
    listing.tokenId = event.params.tokenId
    listing.pricePerItem = event.params.pricePerItem
    listing.listedAt = event.params.listedAt
    listing.status = "Active"
    listing.save()
  }
}

export function handleListingClosed(event: ListingClosed): void {
  let listing = Listing.load(event.params.listingId.toString())

  if (listing) {
    listing.status = "Closed"
    listing.save()
  }
}
