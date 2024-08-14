// File: scripts/deploy-trade-vault.ts

import { ethers } from "hardhat";
import { TradeVaultModule } from "../ignition/modules/TradeVault";
import hre, { ignition } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const results = await ignition.deploy(TradeVaultModule);

  const tradeVaultAddress = await results.tradeVault.address;
  console.log("TradeVault deployed to:", tradeVaultAddress);

  // Verify contract on Basescan (if supported)
  try {
    await hre.run("verify:verify", {
      address: tradeVaultAddress,
      constructorArguments: [
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC
        "0x4200000000000000000000000000000000000006", // WETH
        "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43", // Aerodrome router
        "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70", // ETH/USD price feed
      ],
    });
    console.log("Contract verified on Basescan");
  } catch (error) {
    console.error("Error verifying contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
