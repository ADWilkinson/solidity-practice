import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BallotModule = buildModule("BallotModule", (m) => {
  const contract = m.contract("Ballot");

  return { contract };
});

export default BallotModule;
