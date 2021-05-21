/* eslint-disable func-names */
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { NakamotOsERC721, NakamotOsERC20 } from "../typechain";
import { DECIMALS_MULTIPLIER, NFT_URI, MAX_NFT_SUPPLY } from "../constants";
import setup from "./helpers/setup";
import { advanceBlock } from "./helpers/time";

describe("ERC721", function () {
    let nft: NakamotOsERC721;
    let erc20: NakamotOsERC20;
    let bagHolder: string;
    let userSigner: SignerWithAddress;

    async function hasValidTicketsToOwner(
        numberOfTickets: number,
        firstTicketIndex: number,
        lastTicketIndex: number,
        owner: string,
    ): Promise<boolean> {
        const promises = [];
        for (let i = firstTicketIndex; i < lastTicketIndex; i += 1) {
            promises.push(erc20.ticketToOwner(i));
        }
        const ticketOwners = await Promise.all(promises);
        return ticketOwners.every(address => address === owner);
    }

    beforeEach(async function () {
        const deployment = await setup();
        nft = deployment.nft;
        erc20 = deployment.token;
        bagHolder = deployment.bagHolderAddress;
        userSigner = deployment.userSigner;
    });

    it("has the correct erc20 address", async function () {
        const erc20Address = await nft.nakamotOsErc20();

        expect(erc20Address).to.equal(erc20.address);
    });

    it("has the correct token uri", async function () {
        const tokenURI = await nft.tokenURI(ethers.BigNumber.from(1));

        expect(tokenURI).to.equal(NFT_URI);
    });

    it("allows a token to be burnt for a lotto ticket if block.number < lottoBlock", async function () {
        const amount = ethers.BigNumber.from(1);
        const tokenAmount = amount.mul(DECIMALS_MULTIPLIER);
        await erc20.burn(tokenAmount);

        const tokensBurned = await erc20.burnedTokens(bagHolder);
        const lottoTicket = await erc20.ownerTicketCount(bagHolder);
        const ticketCount = await erc20.ticketCount();
        const isTicketToOwnerValid = await hasValidTicketsToOwner(amount.toNumber(), 0, 0, bagHolder);

        expect(tokensBurned.toString()).to.equal(tokenAmount.toString());
        expect(lottoTicket.toString()).to.equal(amount);
        expect(ticketCount.toString()).to.equal(amount);
        expect(isTicketToOwnerValid).to.equal(true);
    });

    it("allows multiple tokens to be burnt for a lotto ticket if block.number < lottoBlock", async function () {
        const amount = ethers.BigNumber.from(5);
        const tokenAmount = amount.mul(DECIMALS_MULTIPLIER);
        await erc20.burn(tokenAmount);

        const tokensBurned = await erc20.burnedTokens(bagHolder);
        const lottoTicket = await erc20.ownerTicketCount(bagHolder);
        const ticketCount = await erc20.ticketCount();
        const isTicketToOwnerValid = await hasValidTicketsToOwner(
            amount.toNumber(),
            0,
            amount.toNumber() - 1,
            bagHolder,
        );

        expect(tokensBurned.toString()).to.equal(tokenAmount.toString());
        expect(lottoTicket.toString()).to.equal(amount);
        expect(ticketCount.toString()).to.equal(amount);
        expect(isTicketToOwnerValid).to.equal(true);
    });

    it("has zero lotto tickets if not enough tokens are burnt", async function () {
        const amount = ethers.BigNumber.from(1);
        const tokenAmount = amount.add(DECIMALS_MULTIPLIER);
        await erc20.burn(tokenAmount);

        const tokensBurned = await erc20.burnedTokens(bagHolder);
        const lottoTicket = await erc20.ownerTicketCount(bagHolder);
        const ticketCount = await erc20.ticketCount();

        expect(tokensBurned.toString()).to.equal(tokenAmount.toString());
        expect(lottoTicket.toNumber()).to.equal(0);
        expect(ticketCount.toNumber()).to.equal(0);
    });

    it("only allows a token to be burnt if block.number > lottoBlock", async function () {
        await advanceBlock(10);
        const amount = ethers.BigNumber.from(1);
        const tokenAmount = amount.mul(DECIMALS_MULTIPLIER);
        await erc20.burn(tokenAmount);

        const tokensBurned = await erc20.burnedTokens(bagHolder);
        const lottoTicket = await erc20.ownerTicketCount(bagHolder);
        const ticketCount = await erc20.ticketCount();

        expect(tokensBurned.toString()).to.equal(tokenAmount.toString());
        expect(lottoTicket.toNumber()).to.equal(0);
        expect(ticketCount.toNumber()).to.equal(0);
    });

    it("allows multiple lotto tickets to be created by different users", async function () {
        advanceBlock(0);
        const amount = ethers.BigNumber.from(5);
        const tokenAmount = amount.mul(DECIMALS_MULTIPLIER);
        const userAddress = await userSigner.getAddress();
        await erc20.transfer(userAddress, tokenAmount);

        await erc20.burn(tokenAmount);
        await erc20.connect(userSigner).burn(tokenAmount);

        const tokensBurnedByAdmin = await erc20.burnedTokens(bagHolder);
        const adminLottoTickets = await erc20.ownerTicketCount(bagHolder);

        const tokensBurnedByUser = await erc20.burnedTokens(userAddress);
        const userLottoTickets = await erc20.ownerTicketCount(userAddress);

        const ticketCount = await erc20.ticketCount();
        const isTicketToAdminValid = await hasValidTicketsToOwner(
            amount.toNumber(),
            0,
            amount.sub(1).toNumber(),
            bagHolder,
        );
        const isTicketToUserValid = await hasValidTicketsToOwner(
            amount.toNumber(),
            amount.toNumber(),
            amount.mul(2).sub(1).toNumber(),
            userAddress,
        );

        expect(tokensBurnedByAdmin.toString()).to.equal(tokenAmount.toString());
        expect(adminLottoTickets.toString()).to.equal(amount.toString());

        expect(tokensBurnedByUser.toString()).to.equal(tokenAmount.toString());
        expect(userLottoTickets.toString()).to.equal(amount);

        expect(ticketCount.toString()).to.equal(amount.mul(2).toString());
        expect(isTicketToAdminValid).to.equal(true);
        expect(isTicketToUserValid).to.equal(true);
    });

    it("allows claiming multiple nfts at once", async function () {
        const nftMintAmount = ethers.BigNumber.from(5);
        await erc20.burn(nftMintAmount.mul(DECIMALS_MULTIPLIER));
        const balance = await nft.balanceOf(bagHolder);
        await advanceBlock(10);

        expect(balance.toString()).to.equal(nftMintAmount.toString());
    });

    it(`only mints maximum of ${MAX_NFT_SUPPLY} NFTs`, async function () {
        const nftMintAmount = ethers.BigNumber.from(1);

        const calls = MAX_NFT_SUPPLY + 10;
        const promises = [];
        for (let i = 0; i < calls; i += 1) {
            promises.push(erc20.burn(nftMintAmount.mul(DECIMALS_MULTIPLIER)));
        }

        await Promise.all(promises);

        const balance = await nft.balanceOf(bagHolder);

        expect(balance.toString()).to.equal(MAX_NFT_SUPPLY.toString());
    });
});
