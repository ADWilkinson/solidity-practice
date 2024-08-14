// File: ignition/modules/TradeVault.ts

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const AERODROME_ADDRESS = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43"; // Aerodrome router on Base
const ETH_USD_PRICE_FEED = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"; // Chainlink ETH/USD price feed on Base

export const TradeVaultModule = buildModule("TradeVaultModule", (m) => {
  const tradeVault = m.contract("TradeVault", [USDC_ADDRESS, WETH_ADDRESS, AERODROME_ADDRESS, ETH_USD_PRICE_FEED]);

  return { tradeVault };
});
