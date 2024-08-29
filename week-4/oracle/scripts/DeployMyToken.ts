import { viem } from "hardhat";
import { parseEther, formatEther } from "viem";

async function main() {
    const publicClient = await viem.getPublicClient();
    const [deployer, acc1, acc2] = await viem.getWalletClients();
    const contract = await viem.deployContract("MyToken");
    console.log(`Token contract deployed at ${contract.address}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
