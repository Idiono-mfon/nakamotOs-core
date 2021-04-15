import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MAX_SUPPLY, NAME, SYMBOL, NFT_URI, MAX_NFT_SUPPLY } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deployer } = await getNamedAccounts();

    const nft = await deployments.deploy("NakamotOsERC721", {
        from: deployer,
        args: [NAME, SYMBOL, NFT_URI],
    });

    const erc20 = await deployments.deploy("NakamotOsERC20", {
        from: deployer,
        args: [NAME, SYMBOL, MAX_SUPPLY, deployer, nft.address, MAX_NFT_SUPPLY],
        log: true,
    });

    // set erc20 address for nft
    await deployments.execute("NakamotOsERC721", { from: deployer }, "setERC20Address", erc20.address);

    // give up ownership of nft
    await deployments.execute("NakamotOsERC721", { from: deployer }, "renounceOwnership");
};

export default func;
