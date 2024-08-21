import { expect } from "chai";
import { viem } from "hardhat";
import { parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

// TokenSale
const TEST_RATIO = 100n;
const TEST_PRICE = 10n;
const TEST_PURCHASE_SIZE = parseEther("1");
const TEST_RETURN_TOKENS_SIZE = parseEther("50");
// MyToken
const TEST_TOKEN_SUPPLY = BigInt(10 * 10 ** 18);
const TEST_TOKEN_DECIMALS = 18;

// MyNFT

const deployContractFixture = async () => {
  const publicClient = await viem.getPublicClient();
  const [owner, otherAccount] = await viem.getWalletClients();

  const tokenContract = await viem.deployContract("MyToken");
  const nftContract = await viem.deployContract("MyNFT");
  const tokenSaleContract = await viem.deployContract("TokenSale", [
    TEST_RATIO,
    TEST_PRICE,
    tokenContract.address,
    nftContract.address,
  ]);
  const MINTER_ROLE = await tokenContract.read.MINTER_ROLE();
  const giveMinterRoleTokenTx = await tokenContract.write.grantRole([
    MINTER_ROLE,
    tokenSaleContract.address,
  ]);

  await publicClient.waitForTransactionReceipt({ hash: giveMinterRoleTokenTx });

  return {
    publicClient,
    owner,
    otherAccount,
    tokenSaleContract,
    tokenContract,
    nftContract,
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

      expect(totalSupply).to.eq(TEST_TOKEN_SUPPLY);
      expect(name).to.eq("MyToken");
      expect(symbol).to.eq("MTK");
      expect(decimals).to.eq(TEST_TOKEN_DECIMALS);
    });
    it("uses a valid ERC721 as NFT collection", async () => {
      const { nftContract } = await loadFixture(deployContractFixture);
      const [name, symbol] = await Promise.all([
        await nftContract.read.name(),
        await nftContract.read.symbol(),
      ]);

      expect(name).to.eq("MyNFT");
      expect(symbol).to.eq("NFT");
    });
  });
  describe("When a user buys an ERC20 from the Token contract", async () => {
    it("charges the correct amount of ETH", async () => {
      const { publicClient, tokenSaleContract, otherAccount } =
        await loadFixture(deployContractFixture);

      const ethBalanceBefore = await publicClient.getBalance({
        address: otherAccount.account.address,
      });

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: buyTokensTx,
      });

      if (!receipt.status || receipt.status !== "success")
        throw Error("Transaction failed");

      const ethBalanceAfter = await publicClient.getBalance({
        address: otherAccount.account.address,
      });

      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice;
      const gasCost = gasUsed * gasPrice;
      const diff = ethBalanceBefore - ethBalanceAfter - gasCost;

      expect(diff).to.eq(TEST_PURCHASE_SIZE);
    });
    it("gives the correct amount of tokens", async () => {
      const { publicClient, tokenSaleContract, tokenContract, otherAccount } =
        await loadFixture(deployContractFixture);

      const tokenBalanceBefore = await tokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: buyTokensTx,
      });

      if (!receipt.status || receipt.status !== "success")
        throw Error("Transaction failed");

      const tokenBalanceAfter = await tokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);

      const diff = tokenBalanceAfter - tokenBalanceBefore;
      expect(diff).to.eq(TEST_PURCHASE_SIZE * TEST_RATIO);
    });
  });
  describe("When a user burns an ERC20 at the Shop contract", async () => {
    it("gives the correct amount of ETH", async () => {
      throw new Error("Not implemented");
    });
    it("burns the correct amount of tokens", async () => {
      const { publicClient, tokenSaleContract, tokenContract, otherAccount } =
        await loadFixture(deployContractFixture);

      const buyTokensTx = await tokenSaleContract.write.buyTokens({
        value: TEST_PURCHASE_SIZE,
        account: otherAccount.account.address,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: buyTokensTx,
      });

      if (!receipt.status || receipt.status !== "success")
        throw Error("Transaction failed");

      const tokenBalanceBefore = await tokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);

      const approveTx = await tokenContract.write.approve(
        [tokenSaleContract.address, TEST_RETURN_TOKENS_SIZE],
        { account: otherAccount.account.address }
      );

      const approveReceipt = await publicClient.waitForTransactionReceipt({
        hash: approveTx,
      });

      if (!approveReceipt.status || approveReceipt.status !== "success")
        throw Error("Transaction failed");

      const returnTokensTx = await tokenSaleContract.write.returnTokens(
        [TEST_RETURN_TOKENS_SIZE],
        { account: otherAccount.account.address }
      );

      const returnReceipt = await publicClient.waitForTransactionReceipt({
        hash: returnTokensTx,
      });

      if (!returnReceipt.status || returnReceipt.status !== "success")
        throw Error("Transaction failed");

      const tokenBalanceAfter = await tokenContract.read.balanceOf([
        otherAccount.account.address,
      ]);

      const diff = tokenBalanceBefore - tokenBalanceAfter;
      expect(diff).to.eq(TEST_RETURN_TOKENS_SIZE);
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
