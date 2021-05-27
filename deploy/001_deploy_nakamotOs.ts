import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MAX_SUPPLY, NAME, SYMBOL, NFT_URI, MAX_NFT_SUPPLY, BLOCKS_TIL_LOTTO } from "../constants";
import { networkConfig, getNetworkIdFromName } from "../config/networks";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;

    const networkId = Number(getNetworkIdFromName(network.name));
    const networkParams = networkConfig[networkId];

    const { fee, keyHash, vrfCoordinator, linkToken } = networkParams;

    const { deployer } = await getNamedAccounts();

    const bagHolder = network.name === "mainnet" ? "0x6384F5369d601992309c3102ac7670c62D33c239" : deployer;

    const nft = await deployments.deploy("NakamotOsERC721", {
        from: deployer,
        args: [NAME, SYMBOL, NFT_URI],
    });

    const erc20 = await deployments.deploy("NakamotOsERC20", {
        from: deployer,
        args: [
            NAME,
            SYMBOL,
            MAX_SUPPLY,
            bagHolder,
            nft.address,
            MAX_NFT_SUPPLY,
            BLOCKS_TIL_LOTTO,
            keyHash,
            vrfCoordinator,
            linkToken,
            fee,
        ],
        log: true,
    });

    // set erc20 address for nft
    await deployments.execute("NakamotOsERC721", { from: deployer }, "setERC20Address", erc20.address);

    // give up ownership of nft
    await deployments.execute("NakamotOsERC721", { from: deployer }, "renounceOwnership");
};

export default func;
