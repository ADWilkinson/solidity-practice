import { expect } from "chai";
import { viem } from "hardhat";
import { parseEther } from "viem";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";

const deployContractFixture = async () => {
  const publicClient = await viem.getPublicClient();
  const [deployer, acc1, acc2] = await viem.getWalletClients();
  const tokenContract = await viem.deployContract("MyToken");
  console.log(`Token contract deployed at ${tokenContract.address}\n`);
  return {
    publicClient,
    deployer,
    acc1,
    acc2,
    tokenContract,
  };
};

describe("Deploying MyToken", async () => {
  describe("When MyToken is Deployed", async () => {
    it("Has the correct properties", async () => {
      const { tokenContract } = await loadFixture(deployContractFixture);
      expect(await tokenContract.read.name()).to.equal("MyToken");
      expect(await tokenContract.read.symbol()).to.equal("MTK");
      expect(await tokenContract.read.totalSupply()).to.equal(parseEther("0"));
    });
  });
});
