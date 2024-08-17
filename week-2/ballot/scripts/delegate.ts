/**
 *  Script that delegates voting power to another address
 * @Author Andrew Wilkinson
 * @run npx ts-node --files ./scripts/castVote.ts '{ballotAddress}' '{voterAddress}'
 */

import { createPublicClient, http, createWalletClient, toHex, hexToString, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { abi } from "../artifacts/contracts/Ballot.sol/Ballot.json";
require("dotenv").config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const voterPrivateKey = process.env.ALT_PRIVATE_KEY || "";

async function main() {
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2) throw new Error("Parameters not provided");
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress)) throw new Error("Invalid contract address");
  const addressToDelegateTo = getAddress(parameters[1]);
  if (!addressToDelegateTo) throw new Error("Voter address not provided");

  console.log("Getting voter from private key");
  const account = privateKeyToAccount(`0x${voterPrivateKey}`);
  const voter = createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
  console.log("voter address:", voter.account.address);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  const hash = await voter.writeContract({
    address: contractAddress,
    abi,
    functionName: "delegate",
    args: [addressToDelegateTo],
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed", receipt);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
