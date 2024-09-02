import { ethers } from "hardhat";
import { OverflowTest } from "../typechain-types";
import { expect } from "chai";

const SAFE_INCREMENT = 99n;
const UNSAFE_INCREMENT = 199n;

if (SAFE_INCREMENT + UNSAFE_INCREMENT <= 2 ** 8) throw new Error("Test not properly configured");

describe("Testing Overflow operations", async () => {
  let testContract: OverflowTest;

  beforeEach(async () => {
    const testContractFactory = await ethers.getContractFactory("OverflowTest");
    testContract = await testContractFactory.deploy();
    await testContract.waitForDeployment();
    const tx = await testContract.increment(SAFE_INCREMENT);
    await tx.wait();
  });

  describe("When incrementing under safe circumstances", async () => {
    it("increments correctly", async () => {
      const tx = await testContract.increment(SAFE_INCREMENT);
      await tx.wait();
      expect(await testContract.counter()).to.equal(SAFE_INCREMENT * 2);
    });
  });

  describe("When incrementing to overflow", async () => {
    it("reverts", async () => {
      const tx = testContract.increment(UNSAFE_INCREMENT);
      await expect(tx).to.be.reverted;
    });
  });

  describe("When incrementing to overflow within a unchecked block", async () => {
    it("overflows and increments", async () => {
      const initialCounter = await testContract.counter();
      const tx = await testContract.forceIncrement(UNSAFE_INCREMENT);
      await tx.wait();
      const finalCounter = await testContract.counter();
      expect(finalCounter).to.equal(initialCounter + UNSAFE_INCREMENT - 256n);
    });
  });
});
