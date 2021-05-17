import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { task } from "hardhat/config";

import { TASK_ACCOUNTS } from "./task-names";

task(TASK_ACCOUNTS, "Prints the list of accounts", async (_taskArgs, hre) => {
    const signers: SignerWithAddress[] = await hre.ethers.getSigners();
    const addresses = await Promise.all(signers.map(signer => signer.getAddress()));

    // eslint-disable-next-line no-console
    console.log(addresses);
});
