import { task } from "hardhat/config";
import { networkConfig, getNetworkIdFromName } from "../config/networks";
import { START_LOTTERY } from "./task-names";

task(START_LOTTERY, "Starts the NakamotOs lottery")
    .addParam("contract", "The address of the contract that requires LINK")
    .addOptionalParam("amount", "The amount of LINK you need to transfer")
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre;
        const { BigNumber } = ethers;
        const { contract: contractAddress, amount } = taskArgs;
        const { network } = hre;
        const networkId = Number(getNetworkIdFromName(network.name));
        const networkParams = networkConfig[networkId];
        const linkTokenAddress = networkParams.linkToken as string;
        const ercToken = await ethers.getContractFactory("NakamotOsERC20");

        const decimalMultiplier = BigNumber.from(10).pow(18);
        const transferAmount =
            amount !== undefined ? BigNumber.from(amount).mul(decimalMultiplier) : ethers.constants.WeiPerEther;

        const accounts = await ethers.getSigners();
        const signer = accounts[0];

        const linkTokenContract = new ethers.Contract(linkTokenAddress, ercToken.interface, signer);
        try {
            const result = await linkTokenContract.transfer(contractAddress, 100);
            console.log("result", result);
        } catch (error) {
            console.log("made it here");
            console.log({ error });
        }
    });
