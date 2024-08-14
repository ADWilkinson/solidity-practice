import { expect } from "chai";
import { ethers } from "hardhat";
import { parseUnits } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { TradeVault, IERC20, IAerodrome, AggregatorV3Interface } from "../typechain-types";

describe("TradeVault", function () {
  async function deployTradeVaultFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    // Deploy mock contracts
    const MockUSDC = await ethers.getContractFactory("MockERC20");
    const mockUSDC = await MockUSDC.deploy("Mock USDC", "mUSDC", 6);

    const MockWETH = await ethers.getContractFactory("MockERC20");
    const mockWETH = await MockWETH.deploy("Mock WETH", "mWETH", 18);

    const MockAerodrome = await ethers.getContractFactory("MockAerodrome");
    const mockAerodrome = await MockAerodrome.deploy();

    const MockPriceFeed = await ethers.getContractFactory("MockV3Aggregator");
    const mockPriceFeed = await MockPriceFeed.deploy(8, parseUnits("2000", 8)); // 2000 USD per ETH

    // Deploy TradeVault
    const TradeVault = await ethers.getContractFactory("TradeVault");
    const tradeVault = await TradeVault.deploy(
      await mockUSDC.getAddress(),
      await mockWETH.getAddress(),
      await mockAerodrome.getAddress(),
      await mockPriceFeed.getAddress()
    );

    return { tradeVault, mockUSDC, mockWETH, mockAerodrome, mockPriceFeed, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { tradeVault, owner } = await loadFixture(deployTradeVaultFixture);
      expect(await tradeVault.owner()).to.equal(owner.address);
    });

    it("Should set the correct token addresses", async function () {
      const { tradeVault, mockUSDC, mockWETH } = await loadFixture(deployTradeVaultFixture);
      expect(await tradeVault.USDC()).to.equal(await mockUSDC.getAddress());
      expect(await tradeVault.WETH()).to.equal(await mockWETH.getAddress());
    });
  });

  describe("Deposits", function () {
    it("Should allow owner to deposit USDC", async function () {
      const { tradeVault, mockUSDC, owner } = await loadFixture(deployTradeVaultFixture);
      const depositAmount = parseUnits("1000", 6); // 1000 USDC

      await mockUSDC.mint(owner.address, depositAmount);
      await mockUSDC.approve(await tradeVault.getAddress(), depositAmount);

      await expect(tradeVault.deposit(depositAmount)).to.emit(tradeVault, "Deposit").withArgs(depositAmount);

      expect(await mockUSDC.balanceOf(await tradeVault.getAddress())).to.equal(depositAmount);
    });

    it("Should not allow non-owner to deposit", async function () {
      const { tradeVault, mockUSDC, otherAccount } = await loadFixture(deployTradeVaultFixture);
      const depositAmount = parseUnits("1000", 6); // 1000 USDC

      await mockUSDC.mint(otherAccount.address, depositAmount);
      await mockUSDC.connect(otherAccount).approve(await tradeVault.getAddress(), depositAmount);

      await expect(tradeVault.connect(otherAccount).deposit(depositAmount))
        .to.be.revertedWithCustomError(tradeVault, "OwnableUnauthorizedAccount")
        .withArgs(otherAccount.address);
    });
  });

  describe("Withdrawals", function () {
    it("Should allow owner to withdraw all USDC", async function () {
      const { tradeVault, mockUSDC, owner } = await loadFixture(deployTradeVaultFixture);
      const depositAmount = parseUnits("1000", 6); // 1000 USDC

      await mockUSDC.mint(owner.address, depositAmount);
      await mockUSDC.approve(await tradeVault.getAddress(), depositAmount);
      await tradeVault.deposit(depositAmount);

      await expect(tradeVault.withdrawAll()).to.emit(tradeVault, "Withdrawal").withArgs(depositAmount);

      expect(await mockUSDC.balanceOf(await tradeVault.getAddress())).to.equal(0);
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(depositAmount);
    });
  });

  describe("Swaps", function () {
    it("Should swap USDC to WETH", async function () {
      const { tradeVault, mockUSDC, mockWETH, mockAerodrome, owner } = await loadFixture(deployTradeVaultFixture);
      const depositAmount = parseUnits("1000", 6); // 1000 USDC
      const expectedWethAmount = parseUnits("0.5", 18); // 0.5 WETH

      await mockUSDC.mint(owner.address, depositAmount);
      await mockUSDC.approve(await tradeVault.getAddress(), depositAmount);
      await tradeVault.deposit(depositAmount);

      await mockWETH.mint(await mockAerodrome.getAddress(), expectedWethAmount);
      await mockAerodrome.setExpectedOutput(expectedWethAmount);

      await expect(tradeVault.swapAllUSDCToWETH())
        .to.emit(tradeVault, "SwappedToWETH")
        .withArgs(depositAmount, expectedWethAmount);

      expect(await mockWETH.balanceOf(await tradeVault.getAddress())).to.equal(expectedWethAmount);
    });

    // Add more swap tests here...
  });

  // Add more test cases for other functionalities...
});
