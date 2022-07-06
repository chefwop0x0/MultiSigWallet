const MultiSigWallet = artifacts.require("MultiSigWallet");

module.exports = async (deployer, network, accounts) => { 
  if(network=="development") {
    // deploy token
    await deployer.deploy(MultiSigWallet, [accounts[0],accounts[1],accounts[2]], 3);
    MultiSigWalletInstance = await MultiSigWallet.deployed();
    console.log(`MultiSigWalletInstance address: ${MultiSigWalletInstance.address}`);
  }
};
