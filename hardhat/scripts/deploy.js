const { ethers, upgrades, run } = require("hardhat");

async function main() {
  const testNews = await hre.ethers.getContractFactory("TestNews");
  console.log("Deploying TestNews Contract.....");

  const TestNews = await testNews.deploy({
    // gasPrice: 30000000000,
    gasLimit: 8000000,
  });
  await TestNews.waitForDeployment();
  const TestNewsAddress = await TestNews.getAddress();
  console.log("TestNews Contract Address:", TestNewsAddress);
  console.log("----------------------------------------------------------");

  // Verify TestNews
  console.log(
    "For Verifying TestNews use this Command in terminal: yarn hardhat verify --network mumbai DEPLOYED_CONTRCT_ADDRESS"
  );
  const verifyContract = await run("verify:verify", {
    address: TestNewsAddress,
    constructorArguments: [],
  });
  await verifyContract.wait();
  console.log("----------------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// yarn hardhat run scripts/deploy.js --network mumbai
// yarn hardhat verify --network mumbai 0x642f708596faAe01C9E6872ad4d81AE76Ee3d463
