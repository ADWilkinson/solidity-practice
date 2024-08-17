/**
 *  Script that reads the current proposals in the ballot contract
 * @Author Andrew Wilkinson
 * @run npx ts-node --files ./scripts/castVote.ts '{ballotAddress}'
 */

import { createPublicClient, http, hexToString } from "viem";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
require("dotenv").config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {
  let ballotContractAddress = process.argv.slice(2).pop();
  console.log(ballotContractAddress);
  if (!ballotContractAddress || ballotContractAddress.length < 1) throw "No contract provided";

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  let index = 0;
  let hasMoreProposals = true;

  while (hasMoreProposals) {
    try {
      const proposal = (await publicClient.readContract({
        address: ballotContractAddress as `0x${string}`,
        abi,
        functionName: "proposals",
        args: [BigInt(index)],
      })) as any[];

      const name = hexToString(proposal[0], { size: 32 });
      console.log({ index, name, proposal });
      index++;
    } catch (error) {
      console.log("No more proposals to fetch.");
      hasMoreProposals = false;
    }
  }

  console.log(`Total proposals fetched: ${index}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
