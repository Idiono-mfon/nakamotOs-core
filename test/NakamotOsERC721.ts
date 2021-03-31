/* eslint-disable func-names */
import { expect } from "chai";
import { ethers } from "hardhat";
import { NakamotOsERC721, NakamotOsERC20 } from "../typechain";
import { DECIMALS_MULTIPLIER, NFT_URI } from "../constants";
import setup from "./helpers/setup";

describe("ERC721", function () {
    let nft: NakamotOsERC721;
    let erc20: NakamotOsERC20;
    let bagHolder: string;

    beforeEach(async function () {
        const deployment = await setup();
        nft = deployment.nft;
        erc20 = deployment.token;
        bagHolder = deployment.bagHolderAddress;
    });

    it("has the correct erc20 address", async function () {
        const erc20Address = await nft.nakamotOsErc20();

        expect(erc20Address).to.equal(erc20.address);
    });

    it("has the correct token uri", async function () {
        const tokenURI = await nft.tokenURI(ethers.BigNumber.from(1));

        expect(tokenURI).to.equal(NFT_URI);
    });

    it("allows token burner to mint an nft", async function () {
        const nftMintAmount = ethers.BigNumber.from(1);
        await erc20.burn(nftMintAmount.mul(DECIMALS_MULTIPLIER));

        await nft.mint(nftMintAmount);

        const balance = await nft.balanceOf(bagHolder);

        expect(balance.toString()).to.equal(nftMintAmount.toString());

        const nftClaims = await erc20.nftClaims(bagHolder);
        expect(nftClaims.toString()).to.equal("0");
    });

    it("allows claiming multiple nfts at once", async function () {
        const nftMintAmount = ethers.BigNumber.from(5);
        await erc20.burn(nftMintAmount.mul(DECIMALS_MULTIPLIER));

        await nft.mint(nftMintAmount);

        const balance = await nft.balanceOf(bagHolder);

        expect(balance.toString()).to.equal(nftMintAmount.toString());

        const nftClaims = await erc20.nftClaims(bagHolder);
        expect(nftClaims.toString()).to.equal("0");
    });
});
