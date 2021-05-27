import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber } from "ethers";
import { MAX_SUPPLY, NAME, SYMBOL, NFT_URI, MAX_NFT_SUPPLY, BLOCKS_TIL_LOTTO } from "../constants";
import { networkConfig, getNetworkIdFromName } from "../config/networks";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;

    const networkId = Number(getNetworkIdFromName(network.name));
    const networkParams = networkConfig[networkId];

    const { fee, keyHash, vrfCoordinator, linkToken } = networkParams;

    const { deployer } = await getNamedAccounts();

    const bagHolder = network.name === "mainnet" ? "0x80dAD562E9F9db3d81E612De9e623ce6DcEF0516" : deployer;

    const nft = await deployments.deploy("NakamotOsERC721", {
        from: deployer,
        args: [NAME, SYMBOL, NFT_URI],
        gasPrice: BigNumber.from("35000000000"),
        skipIfAlreadyDeployed: true,
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
        gasPrice: BigNumber.from("35000000000"),
        skipIfAlreadyDeployed: true,
    });

    // set erc20 address for nft
    await deployments.execute(
        "NakamotOsERC721",
        { from: deployer, gasPrice: BigNumber.from("35000000000") },
        "setERC20Address",
        erc20.address,
    );

    // give up ownership of nft
    await deployments.execute(
        "NakamotOsERC721",
        { from: deployer, gasPrice: BigNumber.from("35000000000") },
        "renounceOwnership",
    );
};

export default func;
