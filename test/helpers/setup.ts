import { deployments, ethers } from "hardhat";
import { deploy } from ".";
import { MAX_SUPPLY, NAME, SYMBOL, NFT_URI, MAX_NFT_SUPPLY, NETWORK } from "../../constants";
import { NakamotOsERC20, NakamotOsERC721 } from "../../typechain";
import { networkConfig, getNetworkIdFromName } from "../../config/networks";

const setup = deployments.createFixture(async () => {
    const [admin, user] = await ethers.getSigners();
    const bagHolderAddress = await admin.getAddress();
    const networkId = Number(getNetworkIdFromName(NETWORK));
    const networkParams = networkConfig[networkId];
    const { fee, keyHash, vrfCoordinator, linkToken } = networkParams;
    const nft = ((await deploy("NakamotOsERC721", {
        args: [NAME, SYMBOL, NFT_URI],
        connect: admin,
        from: await admin.getAddress(),
    })) as unknown) as NakamotOsERC721;
    const token = ((await deploy("NakamotOsERC20", {
        args: [
            NAME,
            SYMBOL,
            MAX_SUPPLY,
            await admin.getAddress(),
            nft.address,
            MAX_NFT_SUPPLY,
            10,
            keyHash,
            vrfCoordinator,
            linkToken,
            fee,
        ],
        connect: admin,
    })) as unknown) as NakamotOsERC20;

    await nft.setERC20Address(token.address);
    await nft.renounceOwnership();

    return {
        token,
        nft,
        bagHolderAddress,
        userSigner: user,
    };
});

export default setup;
