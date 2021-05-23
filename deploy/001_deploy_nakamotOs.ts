import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MAX_SUPPLY, NAME, SYMBOL, NFT_URI, MAX_NFT_SUPPLY } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre;

    let chainlinkKeyhash;
    let chainlinkVrfCoordinator;
    let chainlinkToken;

    switch (network.name) {
        case "mainnet": {
            chainlinkKeyhash = "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445";
            chainlinkVrfCoordinator = "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952";
            chainlinkToken = "0x514910771af9ca656af840dff83e8264ecf986ca";
            break;
        }
        case "localhost":
        case "kovan": {
            chainlinkKeyhash = "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
            chainlinkVrfCoordinator = "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9";
            chainlinkToken = "0xa36085f69e2889c224210f603d836748e7dc0088";
            break;
        }
        default:
            throw new Error(`not set up for network ${network.name}`);
    }

    const { deployer } = await getNamedAccounts();

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
            deployer,
            nft.address,
            MAX_NFT_SUPPLY,
            chainlinkKeyhash,
            chainlinkVrfCoordinator,
            chainlinkToken,
        ],
        log: true,
    });

    // set erc20 address for nft
    await deployments.execute("NakamotOsERC721", { from: deployer }, "setERC20Address", erc20.address);

    // give up ownership of nft
    await deployments.execute("NakamotOsERC721", { from: deployer }, "renounceOwnership");
};

export default func;
