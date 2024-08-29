import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BallotModule = buildModule("ContractModule", (m) => {
  const contract = m.contract("Contract");

  return { contract };
});

export default BallotModule;
