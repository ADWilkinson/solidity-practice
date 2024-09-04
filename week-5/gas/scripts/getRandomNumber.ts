import { viem } from "hardhat";
import { recoverMessageAddress, hexToSignature } from "viem";
import * as readline from "readline";
import { mine } from "@nomicfoundation/hardhat-network-helpers";

async function blockHashRandomness() {
  const publicClient = await viem.getPublicClient();
  const currentBlock = await publicClient.getBlock();
  const contract = await viem.deployContract("NotQuiteRandom");
  const randomNumber = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock?.number}\nBlock hash: ${currentBlock?.hash}\nRandom number from this block hash: ${randomNumber}`
  );
  await mine(1);
  const currentBlock2 = await publicClient.getBlock();
  const randomNumber2 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock2?.number}\nBlock hash: ${currentBlock2?.hash}\nRandom number from this block hash: ${randomNumber2}`
  );
  await mine(1);
  const currentBlock3 = await publicClient.getBlock();
  const randomNumber3 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock3?.number}\nBlock hash: ${currentBlock3?.hash}\nRandom number from this block hash: ${randomNumber3}`
  );
  await mine(1);
  const currentBlock4 = await publicClient.getBlock();
  const randomNumber4 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock4?.number}\nBlock hash: ${currentBlock4?.hash}\nRandom number from this block hash: ${randomNumber4}`
  );
  await mine(1);
  const currentBlock5 = await publicClient.getBlock();
  const randomNumber5 = await contract.read.getRandomNumber();
  console.log(
    `Block number: ${currentBlock5?.number}\nBlock hash: ${currentBlock5?.hash}\nRandom number from this block hash: ${randomNumber5}`
  );
}

async function tossCoin() {
  const publicClient = await viem.getPublicClient();
  const currentBlock = await publicClient.getBlock();
  const contract = await viem.deployContract("NotQuiteRandom");
  const heads = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock?.number}\nBlock hash: ${currentBlock?.hash}\nThe coin landed as: ${
      heads ? "Heads" : "Tails"
    }`
  );
  await mine(1);
  const currentBlock2 = await publicClient.getBlock();
  const heads2 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock2?.number}\nBlock hash: ${currentBlock2?.hash}\nThe coin landed as: ${
      heads2 ? "Heads" : "Tails"
    }`
  );
  await mine(1);
  const currentBlock3 = await publicClient.getBlock();
  const heads3 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock3?.number}\nBlock hash: ${currentBlock3?.hash}\nThe coin landed as: ${
      heads3 ? "Heads" : "Tails"
    }`
  );
  await mine(1);
  const currentBlock4 = await publicClient.getBlock();
  const heads4 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock4?.number}\nBlock hash: ${currentBlock4?.hash}\nThe coin landed as: ${
      heads4 ? "Heads" : "Tails"
    }`
  );
  await mine(1);
  const currentBlock5 = await publicClient.getBlock();
  const heads5 = await contract.read.tossCoin();
  console.log(
    `Block number: ${currentBlock5?.number}\nBlock hash: ${currentBlock5?.hash}\nThe coin landed as: ${
      heads5 ? "Heads" : "Tails"
    }`
  );
}

blockHashRandomness().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    "Select operation: \n Options: \n [1]: Random from block hash \n [2]: Toss a coin \n [3]: Message signature \n [4]: Random from a sealed seed \n [5]: Random from block hash plus a sealed seed \n [6]: Random from randao \n",
    (answer) => {
      console.log(`Selected: ${answer}`);
      const option = Number(answer);
      switch (option) {
        case 1:
          blockHashRandomness();
          break;
        case 2:
          tossCoin();
          break;
        case 3:
          // TODO
          break;
        case 4:
          // TODO
          break;
        case 5:
          // TODO
          break;
        case 6:
          // TODO
          break;
        default:
          console.log("Invalid");
          break;
      }
      rl.close();
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
