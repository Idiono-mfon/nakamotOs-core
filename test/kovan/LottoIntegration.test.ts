/* eslint-disable func-names */
/* eslint-disable no-await-in-loop */
import { expect } from "chai";
import { BigNumber, Signer, Contract } from "ethers";
import { ethers, network } from "hardhat";

import { DECIMALS_MULTIPLIER, MAX_SUPPLY, NAME, SYMBOL, NFT_URI, MAX_NFT_SUPPLY } from "../../constants";
import { NakamotOsERC721, NakamotOsERC20, LinkToken } from "../../typechain";
import { networkConfig, getNetworkIdFromName } from "../../config/networks";

const deploy = async (
    deploymentName: string,
    { args, connect }: { args: Array<unknown>; connect: Signer },
): Promise<Contract> => {
    const factory = (await ethers.getContractFactory(deploymentName)).connect(connect);

    const instance = await factory.deploy(...args);

    return instance.connect(connect);
};

describe("Nakamotos Integration", function () {
    let nft: NakamotOsERC721;
    let erc20: NakamotOsERC20;
    let bagHolder: string;
    let blocksTilLotto: number;
    let fee: BigNumber;
    let link: LinkToken;

    before(async function () {
        const [admin] = await ethers.getSigners();
        bagHolder = await admin.getAddress();

        const networkId = Number(getNetworkIdFromName(network.name));
        const networkParams = networkConfig[networkId];
        const { keyHash, vrfCoordinator, linkToken: linkTokenAddress } = networkParams;

        fee = networkParams.fee as BigNumber;

        link = ((await ethers.getContractFactory("LinkToken")).attach(
            linkTokenAddress as string,
        ) as unknown) as LinkToken;

        // 3 calls before tests start so expect 3 burns on kovan
        blocksTilLotto = 6;

        nft = ((await deploy("NakamotOsERC721", {
            args: [NAME, SYMBOL, NFT_URI],
            connect: admin,
        })) as unknown) as NakamotOsERC721;

        console.log("deployed nft...");

        erc20 = ((await deploy("NakamotOsERC20", {
            args: [
                NAME,
                SYMBOL,
                MAX_SUPPLY,
                await admin.getAddress(),
                nft.address,
                MAX_NFT_SUPPLY,
                blocksTilLotto,
                keyHash,
                vrfCoordinator,
                link.address,
                fee,
            ],
            connect: admin,
        })) as unknown) as NakamotOsERC20;

        console.log("deployed token...");

        await nft.setERC20Address(erc20.address);

        console.log("finished setup...");
    });

    it("integration", async function () {
        for (let i = 0; i < blocksTilLotto - 3; i += 1) {
            console.log("burn number: ", i);
            await erc20.burn(DECIMALS_MULTIPLIER);
        }

        const ticketCount = await erc20.ownerTicketCount(bagHolder);

        console.log("ticketCount: ", ticketCount.toString());

        expect(ticketCount.lt(blocksTilLotto) && ticketCount.gte(1)).to.equal(true);

        const { hash } = await link.transfer(erc20.address, fee);

        console.log({ hash });

        console.log({ balanceOfErc20: await link.balanceOf(erc20.address) });

        await erc20.startLottery((Math.random() * 100).toFixed(0));

        console.log({ nft: nft.address, token: erc20.address });
    });
});
