/**
 *  Script that reads the current voters in the ballot contract
 * @Author Andrew Wilkinson
 * @run npx ts-node --files ./scripts/castVote.ts '{ballotAddress}'
 */

import { createPublicClient, http, hexToString, getAddress } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
require("dotenv").config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  let voterAddress = process.argv.slice(2)[0];
  let contractAddress = process.argv.slice(2)[1];
  console.log(voterAddress, contractAddress);
  if (!voterAddress && !contractAddress) throw "No address or contract provided";

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  try {
    const voterDetails = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName: "voters",
      args: [voterAddress],
    })) as any;

    console.log(voterDetails);
  } catch (error) {
    console.log("Failed fetching voter");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
