import { expect } from "chai";
import hre, { viem } from "hardhat";
import "@nomicfoundation/hardhat-toolbox-viem";

describe("LobsterExchange", async function () {
  const deployLobsterExchangeFixture = async () => {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();
    const publicClient = await viem.getPublicClient();
    const lobsterToken = await viem.deployContract("LobsterToken");
    const lobsterExchange = await viem.deployContract("LobsterExchange", [lobsterToken.address]);

    return { publicClient, lobsterToken, lobsterExchange, owner, addr1, addr2 };
  };

  const fishLobster = async (lobsterToken: any, publicClient: any, addressToFish: any) => {
    const pendingTx = await lobsterToken.write.fish({ account: addressToFish });
    const finalTx = await publicClient.waitForTransactionReceipt({ hash: pendingTx.hash });
    return finalTx;
  };

  it.only("Should be able to fish one lobster", async function () {
    const { lobsterToken, publicClient, addr1 } = await deployLobsterExchangeFixture();
    const tx = await fishLobster(lobsterToken, publicClient, addr1.address);
    console.log(tx);
    
    expect(await lobsterToken.read.balanceOf([addr1.address as `0x${string}`])).to.equal(1);
  });
});
