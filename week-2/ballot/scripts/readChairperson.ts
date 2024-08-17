/**
 *  Script that reads the current chairperson from the ballot contract
 * @Author Andrew Wilkinson
 * @run npx ts-node --files ./scripts/castVote.ts '{ballotAddress}'
 */

import { createPublicClient, http, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
require("dotenv").config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  let contractAddress = process.argv.slice(2)[0];
  console.log(contractAddress);
  if (!contractAddress) throw "No contract provided";

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  try {
    const chairPerson = (await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName: "chairperson",
    })) as any;

    console.log(chairPerson);
  } catch (error) {
    console.log("Failed fetching chairPerson", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
