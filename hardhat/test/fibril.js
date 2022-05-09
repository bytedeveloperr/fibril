const { expect } = require("chai")
const { BigNumber } = require("ethers")
const { upgrades, ethers } = require("hardhat")
const Fib = require("../artifacts/contracts/Fibril.sol/Fibril.json")

const nullAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
let fibril, token

describe("Fibril", () => {
  it("should deploy fibril successfully", async () => {
    // const Fibril = await ethers.getContractFactory("Fibril")
    // const deploy = await upgrades.deployProxy(Fibril, [], { initializer: "initialize" })
    fibril = await ethers.getContractAt(Fib.abi, "0xa89243C582dA88F499e7e2cb5537002545A5543d")

    expect(fibril.address).length(42)
  })

  it("should not be able to initialize contract after proxy deployment", async () => {
    const [owner] = await ethers.getSigners()

    const tx = fibril.connect(owner).initialize()
    await expect(tx).to.revertedWith("Initializable: contract is already initialized")
  })
})

describe("Mock Token", () => {
  it("should deploy mock token", async () => {
    const totalSupply = 1000
    const [owner] = await ethers.getSigners()

    const MockToken = await ethers.getContractFactory("MockToken")
    const deploy = await MockToken.deploy(BigNumber.from(totalSupply))
    token = await deploy.deployed()

    expect(await deploy.connect(owner).decimals()).to.equal(18)
    expect(await deploy.connect(owner).totalSupply()).to.equal("1000000000000000000000")
  })

  it("should be able to transfer", async () => {
    const [owner, recipient] = await ethers.getSigners()

    const amount = ethers.utils.parseEther("10")
    const tx = await token.connect(owner).transfer(recipient.address, amount)
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("balances should be correct after token transfer", async () => {
    const [owner, account1] = await ethers.getSigners()

    const balance0 = await token.connect(owner).balanceOf(owner.address)
    const balance1 = await token.connect(account1).balanceOf(account1.address)

    expect(balance0).to.equal("990000000000000000000")
    expect(balance1).to.equal("10000000000000000000")
  })
})

describe("Add new creator", () => {
  it("should be able to add new creator", async () => {
    const [owner] = await ethers.getSigners()

    const tx = await fibril.connect(owner).newCreator()
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should not be able to add creator when creator already exist", async () => {
    const [owner] = await ethers.getSigners()

    const tx = fibril.connect(owner).newCreator()
    await expect(tx).to.be.revertedWith("Fibril: Creator already exist")
  })
})

describe("Creators stats", () => {
  it("should return creators count", async () => {
    const [owner] = await ethers.getSigners()

    const count = await fibril.connect(owner).getCreatorCount()
    expect(count).to.equal(1)
  })

  it("should return creator index", async () => {
    const [owner] = await ethers.getSigners()

    const count = await fibril.connect(owner).getCreatorIndex(owner.address)
    expect(count).to.equal(1)
  })

  it("should return creator index", async () => {
    const [_owner, account1] = await ethers.getSigners()

    const count = await fibril.connect(account1).getCreatorIndex(account1.address)
    expect(count).to.equal(0)
  })
})

describe("Support Creator", () => {
  it("should be able to support creator with erc20 token", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "3000000000000000000"
    const creatorId = 1

    await token.connect(account1).approve(fibril.address, amount)
    const tx = await fibril.connect(account1).support(creatorId, token.address, amount)
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should be able to support creator with erc20 token", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "2000000000000000000"
    const creatorId = 1

    await token.connect(account1).approve(fibril.address, amount)
    const tx = await fibril.connect(account1).support(creatorId, token.address, amount)
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should be able to support creator with ETH", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "20000000000000000"
    const creatorId = 1

    const tx = await fibril.connect(account1).supportWithETH(creatorId, amount, { value: amount })
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should not be able to support creator with ETH if amount conflicts", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "30000000000000000"
    const creatorId = 1

    const tx = fibril.connect(account1).supportWithETH(creatorId, amount, { value: "20000000000000000" })
    await expect(tx).to.revertedWith("Fibril: Amount conflict")
  })

  it("should not be able to support creator if erc20 token allowance is not enough", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "30000000000000000"
    const creatorId = 1

    const tx = fibril.connect(account1).support(creatorId, token.address, amount)
    await expect(tx).to.be.revertedWith("Fibril: Allowance is not enough")
  })

  it("should not be able to support creator if account erc20 token balance is not enough", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "100000000000000000000"
    const creatorId = 1

    await token.connect(account1).approve(fibril.address, amount)
    const tx = fibril.connect(account1).support(creatorId, token.address, amount)
    await expect(tx).to.be.revertedWith("Fibril: Insufficient balance")
  })

  it("should not be able to support non-existing creator", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "3000000000000000000"
    const creatorId = 9

    await token.connect(account1).approve(fibril.address, amount)
    const tx = fibril.connect(account1).support(creatorId, token.address, amount)
    await expect(tx).to.be.revertedWith("Fibril: Creator does not exist")
  })

  it("should have updated the creator token balances with the support amount", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const creatorId = 1

    const creatorErc20Balance = await fibril.connect(account1).getBalance(creatorId, token.address)
    const creatorEthBalance = await fibril.connect(account1).getBalance(creatorId, nullAddress)

    expect(creatorErc20Balance).to.equal("3000000000000000000")
    expect(creatorEthBalance).to.equal("2000000000000000000")
  })
})

describe("Creator Token Withdrawal", () => {
  it("should be able to withdraw erc20 token to recipient by creator", async () => {
    const [owner] = await ethers.getSigners()
    const amount = "1000000000000000000"

    const tx = await fibril.connect(owner).withdraw(token.address, amount, owner.address)
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should be able to withdraw erc20 token to recipient by creator", async () => {
    const [owner, account1] = await ethers.getSigners()
    const amount = "1000000000000000000"

    const tx = await fibril.connect(owner).withdraw(token.address, amount, account1.address)
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should be able to withdraw ETH to recipient by creator", async () => {
    const [owner] = await ethers.getSigners()
    const amount = "20000000000000000"

    const tx = await fibril.connect(owner).withdraw(nullAddress, amount, owner.address)
    const result = await tx.wait()

    expect(result.status).to.equal(1)
  })

  it("should not be able to withdraw more than creator erc20 token balance to recipient", async () => {
    const [owner] = await ethers.getSigners()
    const amount = "5000000000000000000"

    const tx = fibril.connect(owner).withdraw(token.address, amount, owner.address)
    await expect(tx).to.revertedWith("Fibril: Insufficient balance")
  })

  it("should not be able to withdraw erc20 token to recipient if caller is not creator", async () => {
    const [_owner, account1] = await ethers.getSigners()
    const amount = "1000000000000000000"

    const tx = fibril.connect(account1).withdraw(token.address, amount, account1.address)
    await expect(tx).to.revertedWith("Fibril: Creator does not exist")
  })

  it("should have subtracted the creator erc20 token balance with the withdraw amount", async () => {
    const [owner] = await ethers.getSigners()
    const creatorId = 1

    const creatorErc20Balance = await fibril.connect(owner).getBalance(creatorId, token.address)
    const creatorEthBalance = await fibril.connect(owner).getBalance(creatorId, nullAddress)

    expect(creatorErc20Balance).to.equal("3000000000000000000")
    expect(creatorEthBalance).to.equal("0")
  })
})
