const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AevocadoTreeModule", (m: any) => {
  const aevocadoTree = m.contract("AevocadoTree");
  
  return { aevocadoTree };
});