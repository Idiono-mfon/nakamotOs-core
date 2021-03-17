import { task } from "hardhat/config";

import { TRANSFER } from "./task-names";

const DEFAULT_TRANSFER = 10;

task(TRANSFER, "transfer NakamotOs to whomever you wish")
    .addParam("recipient", "The recipient of the transfer")
    .addParam("amount", "The amount to transfer w/o decimals")
    .setAction(async (_taskArgs, hre) => {
        const { recipient, amount } = _taskArgs;
        const { BigNumber } = hre.ethers;

        if (!hre.ethers.utils.isAddress(recipient)) {
            throw new Error(`${recipient} is not an address`);
        }

        const decimalMultiplier = BigNumber.from(10).pow(18);
        let transferAmount;
        if (amount) {
            transferAmount = BigNumber.from(amount).mul(decimalMultiplier);
        } else {
            transferAmount = decimalMultiplier.mul(DEFAULT_TRANSFER);
        }

        const { deployer } = await hre.getNamedAccounts();

        const response = await hre.deployments.execute(
            "NakamotOs",
            { from: deployer },
            "transfer",
            recipient,
            transferAmount,
        );

        console.log({ response });
    });
