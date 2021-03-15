import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MAX_SUPPLY, NAME, SYMBOL } from "../constants";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;

    const { deployer } = await getNamedAccounts();

    await deployments.deploy("NakamotOs", {
        from: deployer,
        args: [NAME, SYMBOL, MAX_SUPPLY, deployer],
        log: true,
    });
};

export default func;
