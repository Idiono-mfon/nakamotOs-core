import { deployments, ethers } from "hardhat";
import { deploy } from ".";
import { MAX_SUPPLY, NAME, SYMBOL, NFT_URI } from "../../constants";
import { NakamotOsERC20, NakamotOsERC721 } from "../../typechain";

const setup = deployments.createFixture(async () => {
    const admin = await ethers.getNamedSigner("admin");
    const bagHolderAddress = await admin.getAddress();
    const nft = (await deploy("NakamotOsERC721", {
        args: [NAME, SYMBOL, NFT_URI],
        connect: admin,
        from: await admin.getAddress(),
    })) as NakamotOsERC721;
    const token = (await deploy("NakamotOsERC20", {
        args: [NAME, SYMBOL, MAX_SUPPLY, await admin.getAddress(), nft.address],
        connect: admin,
    })) as NakamotOsERC20;

    await nft.setERC20Address(token.address);
    await nft.renounceOwnership();

    return {
        token,
        nft,
        bagHolderAddress,
    };
});

export default setup;
