import { toHex, hexToString } from "viem";
import { viem } from "hardhat";
import { vars } from "hardhat/config";
import { formatEther, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import hre from "hardhat";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

async function main() {
  
  console.log("Getting deployer from private key");
  const account = privateKeyToAccount(`0x${vars.get("PRIVATE_KEY")}`);
  const deployer = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${vars.get("ALCHEMY_API_KEY")}`),
  });
  console.log("Deployer address:", deployer.account.address);

  const publicClient = await viem.getPublicClient();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("Deployer balance:", formatEther(balance), deployer.chain.nativeCurrency.symbol);

  console.log("Proposals: ");
  PROPOSALS.forEach((element, index) => {
    console.log(`Proposal N. ${index + 1}: ${element}`);
  });

  const ballotContract = await viem.deployContract("Ballot", [PROPOSALS.map((prop) => toHex(prop, { size: 32 }))]);
  
  console.log("Ballot contract deployed to:", ballotContract.address);

  console.log("Try to verify contract on Etherscan");
  try {
    await hre.run("verify:verify", {
      address: ballotContract.address,
      constructorArguments: [PROPOSALS.map((prop) => toHex(prop, { size: 32 }))],
    });
    console.log("Contract verified");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }

  console.log("Proposals: ");
  for (let index = 0; index < PROPOSALS.length; index++) {
    const proposal = await ballotContract.read.proposals([BigInt(index)]);
    const name = hexToString(proposal[0], { size: 32 });
    console.log({ index, name, proposal });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
