import { expect } from "chai";
import { viem } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

const TEST_RATIO = 100n;
const TEST_PRICE = 10n;

const deployContractFixture = async () => {
  const publicClient = await viem.getPublicClient();
  const [owner, otherAccount] = await viem.getWalletClients();
  const tokenSaleContract = await viem.deployContract("TokenSale", [
    TEST_RATIO,
    TEST_PRICE,
  ]);
  return {
    publicClient,
    owner,
    otherAccount,
    tokenSaleContract,
  };
};

describe("NFT Shop", async () => {
  describe("When the Shop contract is deployed", async () => {
    it("defines the ratio as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const contractRatio = await tokenSaleContract.read.ratio();
      expect(contractRatio).to.be.eq(TEST_RATIO);
    });
    it("defines the price as provided in parameters", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const contractPrice = await tokenSaleContract.read.price();
      expect(contractPrice).to.be.eq(TEST_PRICE);
    });
    it("uses a valid ERC20 as payment token", async () => {
      const { tokenSaleContract } = await loadFixture(deployContractFixture);
      const paymentTokenAddress = await tokenSaleContract.read.paymentToken();
      const paymentTokenContract = await viem.getContractAt(
        "MyToken",
        paymentTokenAddress
      );
      const [totalSupply, name, symbol, decimals] = await Promise.all([
        await paymentTokenContract.read.totalSupply(),
        await paymentTokenContract.read.name(),
        await paymentTokenContract.read.symbol(),
        await paymentTokenContract.read.decimals(),
      ]);

      expect(totalSupply).to.eq(0n);
      expect(name).to.eq("MyToken");
      expect(symbol).to.eq("MTK");
      expect(decimals).to.eq(18n);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("gives the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("burns the correct amount of tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user buys an NFT from the Shop contract", async () => {
    it("charges the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("gives the correct NFT", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When a user burns their NFT at the Shop contract", async () => {
    it("gives the correct amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
  });
  describe("When the owner withdraws from the Shop contract", async () => {
    it("recovers the right amount of ERC20 tokens", async () => {
      throw new Error("Not implemented");
    });
    it("updates the owner pool account correctly", async () => {
      throw new Error("Not implemented");
    });
  });
});
