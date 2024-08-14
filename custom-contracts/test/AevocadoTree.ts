import { expect } from "chai";
import hre from "hardhat";
import "@nomicfoundation/hardhat-toolbox-viem";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

describe("AevocadoTree", function () {
  async function deployAevocadoTreeFixture() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const EXCHANGE_RATIO = 100;
    const MAX_SUPPLY = hre.ethers.parseEther("1000000"); // 1 million AEVOCADO

    const aevocadoTreeModule = buildModule("AevocadoTreeModule", (m) => {
      const mockAEVO = m.contract("MockERC20", ["AEVO Token", "AEVO", 18]);
      const aevocadoTree = m.contract("AevocadoTree", [mockAEVO, EXCHANGE_RATIO, MAX_SUPPLY]);

      return { mockAEVO, aevocadoTree };
    });

    const deploymentResult = await hre.ignition.deploy(aevocadoTreeModule);
    const mockAEVOAddress = await deploymentResult.mockAEVO.address;
    const aevocadoTreeAddress = await deploymentResult.aevocadoTree.address;

    const aevoToken = await hre.ethers.getContractAt("MockERC20", mockAEVOAddress);
    const aevocadoTree = await hre.ethers.getContractAt("AevocadoTree", aevocadoTreeAddress);

    // Mint some AEVO tokens to addr1
    await aevoToken.mint(addr1.address, hre.ethers.parseEther("10000"));

    return { aevocadoTree, aevoToken, owner, addr1, addr2, EXCHANGE_RATIO, MAX_SUPPLY };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { aevocadoTree } = await deployAevocadoTreeFixture();
      expect(await aevocadoTree.name()).to.equal("AevocadoTree");
      expect(await aevocadoTree.symbol()).to.equal("AEVOCADO");
    });

    it("Should set the correct initial values", async function () {
      const { aevocadoTree, aevoToken, EXCHANGE_RATIO, MAX_SUPPLY } = await deployAevocadoTreeFixture();
      expect(await aevocadoTree.AEVO_CONTRACT_ADDRESS()).to.equal(await aevoToken.getAddress());
      expect(await aevocadoTree.EXCHANGE_RATIO()).to.equal(EXCHANGE_RATIO);
      expect(await aevocadoTree.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });
  });

  describe("depositAevoForAevocado", function () {
    it("Should mint AEVOCADO tokens when depositing AEVO", async function () {
      const { aevocadoTree, aevoToken, addr1, EXCHANGE_RATIO } = await deployAevocadoTreeFixture();
      const depositAmount = hre.ethers.parseEther("1000");

      // @ts-ignore
      await aevoToken.connect(addr1).approve(await aevocadoTree.getAddress(), depositAmount);

      // @ts-ignore
      const tx = aevocadoTree.connect(addr1).depositAevoForAevocado(depositAmount);

      await expect(tx)
        .to.emit(aevocadoTree, "AevoDeposited")
        .withArgs(addr1.address, depositAmount, depositAmount / BigInt(EXCHANGE_RATIO));

      expect(await aevocadoTree.balanceOf(addr1.address)).to.equal(depositAmount / BigInt(EXCHANGE_RATIO));
    });

    it("Should revert if amount is not divisible by EXCHANGE_RATIO", async function () {
      const { aevocadoTree, aevoToken, addr1 } = await deployAevocadoTreeFixture();
      const depositAmount = hre.ethers.parseEther("999");

      await aevoToken.connect(addr1).approve(await aevocadoTree.getAddress(), depositAmount);

      await expect(aevocadoTree.connect(addr1).depositAevoForAevocado(depositAmount)).to.be.rejectedWith(
        "Amount must be divisible by 100"
      );
    });

    it("Should revert if deposit would exceed MAX_SUPPLY", async function () {
      const { aevocadoTree, aevoToken, addr1, EXCHANGE_RATIO, MAX_SUPPLY } = await deployAevocadoTreeFixture();
      const depositAmount = MAX_SUPPLY * BigInt(EXCHANGE_RATIO) + 1n;

      await aevoToken.mint(addr1.address, depositAmount);
      await aevoToken.connect(addr1).approve(await aevocadoTree.getAddress(), depositAmount);

      await expect(aevocadoTree.connect(addr1).depositAevoForAevocado(depositAmount)).to.be.rejectedWith(
        "Exceeds max supply"
      );
    });
  });

  describe("convertAevocadoToAevo", function () {
    it("Should burn AEVOCADO tokens and return AEVO", async function () {
      const { aevocadoTree, aevoToken, addr1, EXCHANGE_RATIO } = await deployAevocadoTreeFixture();
      const initialDepositAmount = hre.ethers.parseEther("1000");
      const convertAmount = hre.ethers.parseEther("5");

      // Initial deposit
      await aevoToken.connect(addr1).approve(await aevocadoTree.getAddress(), initialDepositAmount);
      await aevocadoTree.connect(addr1).depositAevoForAevocado(initialDepositAmount);

      const tx = aevocadoTree.connect(addr1).convertAevocadoToAevo(convertAmount);

      await expect(tx)
        .to.emit(aevocadoTree, "AevocadoConverted")
        .withArgs(addr1.address, convertAmount, convertAmount * BigInt(EXCHANGE_RATIO));

      expect(await aevocadoTree.balanceOf(addr1.address)).to.equal(hre.ethers.parseEther("5"));
      expect(await aevoToken.balanceOf(addr1.address)).to.equal(hre.ethers.parseEther("9500"));
    });

    it("Should revert if contract has insufficient AEVO balance", async function () {
      const { aevocadoTree, aevoToken, owner, addr1, addr2 } = await deployAevocadoTreeFixture();
      const initialDepositAmount = hre.ethers.parseEther("1000");
      const convertAmount = hre.ethers.parseEther("5");

      // Initial deposit
      await aevoToken.connect(addr1).approve(await aevocadoTree.getAddress(), initialDepositAmount);
      await aevocadoTree.connect(addr1).depositAevoForAevocado(initialDepositAmount);

      // Remove AEVO from the contract to simulate insufficient balance
      await aevoToken.connect(owner).transfer(addr2.address, initialDepositAmount);

      await expect(aevocadoTree.connect(addr1).convertAevocadoToAevo(convertAmount)).to.be.rejectedWith(
        "Insufficient AEVO balance in contract"
      );
    });
  });
});
