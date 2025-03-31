const Migrations = artifacts.require("Migrations");
const IdentityVerification = artifacts.require("IdentityVerification");

module.exports = function(deployer) {
  // Deploy the Migrations contract first
  deployer.deploy(Migrations);
  
  // Deploy the IdentityVerification contract
  deployer.deploy(IdentityVerification);
};