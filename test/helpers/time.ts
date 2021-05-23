import { network } from "hardhat";

export const advanceBlock = async (numberOfBlocks: number): Promise<void> => {
    const promises = [];
    for (let i = 0; i < numberOfBlocks; i += 1) {
        promises.push(network.provider.send("evm_mine", []));
    }
    await Promise.all(promises);
};
