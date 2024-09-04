import { viem } from "hardhat";
import { recoverMessageAddress, hexToSignature } from "viem";
import * as readline from "readline";
import { mine } from "@nomicfoundation/hardhat-network-helpers";


async function main() {
  const publicClient = await viem.getPublicClient();
  console.log("Deploying contract");
  const contract = await viem.deployContract("Random");
  const currentBlock = await publicClient.getBlock();
  const randomNumber = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock?.number}\nBlock difficulty: ${currentBlock?.difficulty}\nRandom number from this block difficulty: ${randomNumber}`
  );
  await mine(1);
  const currentBlock2 = await publicClient.getBlock();
  const randomNumber2 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock2?.number}\nBlock difficulty: ${currentBlock2?.difficulty}\nRandom number from this block difficulty: ${randomNumber2}`
  );
  await mine(1);
  const currentBlock3 = await publicClient.getBlock();
  const randomNumber3 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock3?.number}\nBlock difficulty: ${currentBlock3?.difficulty}\nRandom number from this block difficulty: ${randomNumber3}`
  );
  await mine(1);
  const currentBlock4 = await publicClient.getBlock();
  const randomNumber4 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock4?.number}\nBlock difficulty: ${currentBlock4?.difficulty}\nRandom number from this block difficulty: ${randomNumber4}`
  );
  await mine(1);
  const currentBlock5 = await publicClient.getBlock();
  const randomNumber5 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock5?.number}\nBlock difficulty: ${currentBlock5?.difficulty}\nRandom number from this block difficulty: ${randomNumber5}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
