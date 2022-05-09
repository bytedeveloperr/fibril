// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Creator extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));

    this.set("address", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Creator entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Creator must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Creator", id.toString(), this);
    }
  }

  static load(id: string): Creator | null {
    return changetype<Creator | null>(store.get("Creator", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get tokenBalances(): Array<Bytes> {
    let value = this.get("tokenBalances");
    return value!.toBytesArray();
  }

  set tokenBalances(value: Array<Bytes>) {
    this.set("tokenBalances", Value.fromBytesArray(value));
  }

  get supporters(): Array<Bytes> {
    let value = this.get("supporters");
    return value!.toBytesArray();
  }

  set supporters(value: Array<Bytes>) {
    this.set("supporters", Value.fromBytesArray(value));
  }

  get activities(): Array<Bytes> {
    let value = this.get("activities");
    return value!.toBytesArray();
  }

  set activities(value: Array<Bytes>) {
    this.set("activities", Value.fromBytesArray(value));
  }

  get nfts(): Array<Bytes> {
    let value = this.get("nfts");
    return value!.toBytesArray();
  }

  set nfts(value: Array<Bytes>) {
    this.set("nfts", Value.fromBytesArray(value));
  }
}

export class TokenBalance extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));

    this.set("amount", Value.fromBigInt(BigInt.zero()));
    this.set("creator", Value.fromString(""));
    this.set("token", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save TokenBalance entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type TokenBalance must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("TokenBalance", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): TokenBalance | null {
    return changetype<TokenBalance | null>(
      store.get("TokenBalance", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get amount(): BigInt {
    let value = this.get("amount");
    return value!.toBigInt();
  }

  set amount(value: BigInt) {
    this.set("amount", Value.fromBigInt(value));
  }

  get creator(): string {
    let value = this.get("creator");
    return value!.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }

  get token(): Bytes {
    let value = this.get("token");
    return value!.toBytes();
  }

  set token(value: Bytes) {
    this.set("token", Value.fromBytes(value));
  }
}

export class Activity extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));

    this.set("type", Value.fromString(""));
    this.set("method", Value.fromString(""));
    this.set("token", Value.fromBytes(Bytes.empty()));
    this.set("to", Value.fromBytes(Bytes.empty()));
    this.set("from", Value.fromBytes(Bytes.empty()));
    this.set("value", Value.fromBigInt(BigInt.zero()));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("creator", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Activity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Activity must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Activity", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Activity | null {
    return changetype<Activity | null>(store.get("Activity", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get type(): string {
    let value = this.get("type");
    return value!.toString();
  }

  set type(value: string) {
    this.set("type", Value.fromString(value));
  }

  get method(): string {
    let value = this.get("method");
    return value!.toString();
  }

  set method(value: string) {
    this.set("method", Value.fromString(value));
  }

  get token(): Bytes {
    let value = this.get("token");
    return value!.toBytes();
  }

  set token(value: Bytes) {
    this.set("token", Value.fromBytes(value));
  }

  get to(): Bytes {
    let value = this.get("to");
    return value!.toBytes();
  }

  set to(value: Bytes) {
    this.set("to", Value.fromBytes(value));
  }

  get from(): Bytes {
    let value = this.get("from");
    return value!.toBytes();
  }

  set from(value: Bytes) {
    this.set("from", Value.fromBytes(value));
  }

  get value(): BigInt {
    let value = this.get("value");
    return value!.toBigInt();
  }

  set value(value: BigInt) {
    this.set("value", Value.fromBigInt(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get creator(): string {
    let value = this.get("creator");
    return value!.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }
}

export class NftItem extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));

    this.set("address", Value.fromBytes(Bytes.empty()));
    this.set("tokenId", Value.fromBigInt(BigInt.zero()));
    this.set("price", Value.fromBigInt(BigInt.zero()));
    this.set("seller", Value.fromBytes(Bytes.empty()));
    this.set("paymentToken", Value.fromBytes(Bytes.empty()));
    this.set("tokenType", Value.fromString(""));
    this.set("isListed", Value.fromBoolean(false));
    this.set("timestamp", Value.fromBigInt(BigInt.zero()));
    this.set("creator", Value.fromString(""));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save NftItem entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type NftItem must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("NftItem", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): NftItem | null {
    return changetype<NftItem | null>(store.get("NftItem", id.toHexString()));
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get tokenId(): BigInt {
    let value = this.get("tokenId");
    return value!.toBigInt();
  }

  set tokenId(value: BigInt) {
    this.set("tokenId", Value.fromBigInt(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value!.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }

  get seller(): Bytes {
    let value = this.get("seller");
    return value!.toBytes();
  }

  set seller(value: Bytes) {
    this.set("seller", Value.fromBytes(value));
  }

  get paymentToken(): Bytes {
    let value = this.get("paymentToken");
    return value!.toBytes();
  }

  set paymentToken(value: Bytes) {
    this.set("paymentToken", Value.fromBytes(value));
  }

  get tokenType(): string {
    let value = this.get("tokenType");
    return value!.toString();
  }

  set tokenType(value: string) {
    this.set("tokenType", Value.fromString(value));
  }

  get isListed(): boolean {
    let value = this.get("isListed");
    return value!.toBoolean();
  }

  set isListed(value: boolean) {
    this.set("isListed", Value.fromBoolean(value));
  }

  get timestamp(): BigInt {
    let value = this.get("timestamp");
    return value!.toBigInt();
  }

  set timestamp(value: BigInt) {
    this.set("timestamp", Value.fromBigInt(value));
  }

  get creator(): string {
    let value = this.get("creator");
    return value!.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }
}

export class Supporter extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));

    this.set("creator", Value.fromString(""));
    this.set("address", Value.fromBytes(Bytes.empty()));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Supporter entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Supporter must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Supporter", id.toBytes().toHexString(), this);
    }
  }

  static load(id: Bytes): Supporter | null {
    return changetype<Supporter | null>(
      store.get("Supporter", id.toHexString())
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    return value!.toBytes();
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  get creator(): string {
    let value = this.get("creator");
    return value!.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value!.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }
}
