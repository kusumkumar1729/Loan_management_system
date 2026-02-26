const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying LoanManagement contract...");

    const [deployer] = await ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);

    const LoanManagement = await ethers.getContractFactory("LoanManagement");
    const contract = await LoanManagement.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ LoanManagement deployed to:", contractAddress);

    // Save contract address and ABI for backend use
    const deploymentInfo = {
        address: contractAddress,
        deployer: deployer.address,
        network: "localhost",
        deployedAt: new Date().toISOString(),
    };

    // Save to blockchain directory
    fs.writeFileSync(
        path.join(__dirname, "../deployment.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );

    // Copy ABI to backend for use
    const artifactPath = path.join(
        __dirname,
        "../artifacts/contracts/LoanManagement.sol/LoanManagement.json"
    );

    if (fs.existsSync(artifactPath)) {
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

        const backendContractsDir = path.join(
            __dirname,
            "../../backend_loan/contracts"
        );

        if (!fs.existsSync(backendContractsDir)) {
            fs.mkdirSync(backendContractsDir, { recursive: true });
        }

        fs.writeFileSync(
            path.join(backendContractsDir, "LoanManagement.json"),
            JSON.stringify({ abi: artifact.abi, address: contractAddress }, null, 2)
        );

        console.log("📄 ABI + Address saved to backend_loan/contracts/");
    }

    console.log("\n🎉 Deployment complete!");
    console.log("Contract Address:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
