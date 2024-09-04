// async function signature() {
//   const signers = await viem.getWalletClients();
//   const signer = signers[0];
//   console.log(`Signing a message with the account of address ${signer.account.address}`);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("Enter a message to be signed:\n", async (answer) => {
//     const signedMessage = await signer.signMessage({ message: answer });
//     console.log(`The signed message is:\n${signedMessage}`);
//     rl.close();
//     testSignature();
//   });
// }

// async function testSignature() {
//   console.log("Verifying signature\n");
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("Enter message signature:\n", (userSignature) => {
//     rl.question("Enter message:\n", async (message) => {
//       const signature = userSignature as `0x${string}` | Uint8Array;
//       const address = await recoverMessageAddress({ message, signature });
//       console.log(`This message signature matches with address ${address}`);
//       rl.question("Repeat? [Y/N]:\n", (answer) => {
//         rl.close();
//         if (answer.toLowerCase() === "y") {
//           testSignature();
//         }
//       });
//     });
//   });
// }

// async function sealedSeed() {
//   console.log("Deploying contract");
//   const contract = await viem.deployContract("PseudoRandom");
//   const signers = await viem.getWalletClients();
//   const signer = signers[0];
//   console.log(`Signing a message with the account of address ${signer.account.address}`);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("Enter a random seed to be signed:\n", async (seed) => {
//     const signedMessage = await signer.signMessage({ message: seed });
//     rl.close();
//     console.log(`The signed message is:\n${signedMessage}`);
//     const sig = hexToSignature(signedMessage);
//     console.log("Saving signature at contract");
//     const sigV = sig.v ? Number(sig.v) : 0;
//     await contract.write.setSignature([sigV, sig.r, sig.s]);
//     try {
//       console.log("Trying to get a number with the original seed");
//       const randomNumber = await contract.read.getRandomNumber([seed]);
//       console.log(`Random number result:\n${randomNumber}`);
//       console.log("Trying to get a number without the original seed");
//       const fakeSeed = "FAKE_SEED";
//       const randomNumber2 = await contract.read.getRandomNumber([fakeSeed]);
//       console.log(`Random number result:\n${randomNumber2}`);
//     } catch (error) {
//       console.log("Operation failed");
//     }
//   });
// }

// async function randomSealedSeed() {
//   console.log("Deploying contract");
//   const contract = await viem.deployContract("PseudoRandom");
//   const signers = await viem.getWalletClients();
//   const signer = signers[0];
//   console.log(`Signing a message with the account of address ${signer.account.address}`);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question("Enter a random seed to be signed:\n", async (seed) => {
//     const signedMessage = await signer.signMessage({ message: seed });
//     rl.close();
//     console.log(`The signed message is:\n${signedMessage}`);
//     const sig = hexToSignature(signedMessage);
//     console.log("Saving signature at contract");
//     const sigV = sig.v ? Number(sig.v) : 0;
//     await contract.write.setSignature([sigV, sig.r, sig.s]);
//     try {
//       console.log("Trying to get a number with the original seed");
//       const randomNumber = await contract.read.getCombinedRandomNumber([seed]);
//       console.log(`Random number result:\n${randomNumber}`);
//       console.log("Trying to get a number without the original seed");
//       const fakeSeed = "FAKE_SEED";
//       const randomNumber2 = await contract.read.getCombinedRandomNumber([fakeSeed]);
//       console.log(`Random number result:\n${randomNumber2}`);
//     } catch (error) {
//       console.log("Operation failed");
//     }
//   });
// }
