import { task } from "hardhat/config";
import { networkConfig, getNetworkIdFromName } from "../helper-hardhat-config";
import { START_LOTTERY } from "./task-names";

task(START_LOTTERY, "Starts the NakamotOs lottery")
    .addParam("contract", "The address of the contract that requires LINK")
    .addOptionalParam("linkaddress", "Set the LINK token address")
    .setAction(async (taskArgs, hre) => {
        const { ethers } = hre;
        const contractAddress = taskArgs.contract;
        const { network } = hre;
        const networkId = Number(getNetworkIdFromName(network.name));
        const networkParams = networkConfig[networkId];
        const linkTokenAddress = networkParams.linkToken || taskArgs.linkaddress;
        const LinkToken = await ethers.getContractFactory("LinkToken");

        const amount = ethers.utils.hexlify(ethers.constants.WeiPerEther);
        console.log(amount);

        const accounts = await ethers.getSigners();
        const signer = accounts[0];

        const linkTokenContract = new ethers.Contract(linkTokenAddress, LinkToken.interface, signer);
        const result = await linkTokenContract
            .transfer(contractAddress, amount)
            .then((transaction: any) => {
                console.log("Contract ", contractAddress, " funded with 1 LINK. Transaction Hash: ", transaction.hash);
            })
            .catch((err: any) => {
                console.log("hello error");
                console.log(err);
            });
        console.log("result", result);
    });
