/* eslint-disable func-names */
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";

import { NakamotOsERC20, NakamotOsERC721 } from "../typechain";
import { DECIMALS_MULTIPLIER, MAX_SUPPLY, MAX_NFT_SUPPLY } from "../constants";
import setup from "./helpers/setup";
import { advanceBlock } from "./helpers/time";

describe("ERC20", function () {
    let token: NakamotOsERC20;
    let nft: NakamotOsERC721;
    let bagHolderAddress: string;
    let blocksTilLotto: number;

    beforeEach(async function () {
        const deployment = await setup();
        token = deployment.token;
        nft = deployment.nft;
        bagHolderAddress = deployment.bagHolderAddress;
        blocksTilLotto = deployment.blocksTilLotto;
    });

    it(`should have a total supply of ${MAX_SUPPLY}`, async function () {
        expect((await token.totalSupply()).toString()).to.equal(MAX_SUPPLY.toString());
    });

    it("entire supply should be minted to bagHolder", async function () {
        expect((await token.balanceOf(bagHolderAddress)).toString()).to.equal(MAX_SUPPLY.toString());
    });

    describe("Burn Function", () => {
        it("allows burning the token", async function () {
            const burnAmount = DECIMALS_MULTIPLIER.mul(10);
            await token.burn(burnAmount);
            const expectedAmountLeft = MAX_SUPPLY.sub(burnAmount);

            expect((await token.burnedTokens(bagHolderAddress)).toString()).to.equal(burnAmount.toString());
            expect((await token.balanceOf(bagHolderAddress)).toString()).to.equal(expectedAmountLeft.toString());

            expect((await token.totalSupply()).toString()).to.equal(expectedAmountLeft.toString());
        });

        it("allows burning the token multiple times", async function () {
            const burnAmount = DECIMALS_MULTIPLIER.mul(3);
            const burnTimes = 3;

            const burnPromises = [];
            for (let i = 0; i < burnTimes; i += 1) {
                burnPromises.push(token.burn(burnAmount));
            }

            await Promise.all(burnPromises);

            expect((await token.burnedTokens(bagHolderAddress)).toString()).to.equal(
                burnAmount.mul(burnTimes).toString(),
            );
        });

        it("burn token before lotto block gives burner a ticket", async function () {
            const blockNum = await ethers.provider.getBlockNumber();
            const lottoBlock = await token.lottoBlock();

            expect(lottoBlock.gt(blockNum)).to.equal(true);

            const ticketCountBefore = await token.ownerTicketCount(bagHolderAddress);

            expect(ticketCountBefore.toNumber()).to.equal(0);

            await token.burn(DECIMALS_MULTIPLIER);

            const ticketCountAfter = await token.ownerTicketCount(bagHolderAddress);

            expect(ticketCountAfter.toNumber()).to.equal(1);
        });

        it("burn token after lotto block does not give burner a ticket", async function () {
            await advanceBlock(blocksTilLotto);

            const blockNum = await ethers.provider.getBlockNumber();
            const lottoBlock = await token.lottoBlock();

            expect(lottoBlock.lt(blockNum)).to.equal(true);

            const ticketCountBefore = await token.ownerTicketCount(bagHolderAddress);

            expect(ticketCountBefore.toNumber()).to.equal(0);

            await token.burn(DECIMALS_MULTIPLIER);

            const ticketCountAfter = await token.ownerTicketCount(bagHolderAddress);

            expect(ticketCountAfter.toNumber()).to.equal(0);
        });

        it("allows running the lottery with 1 ticket", async function () {
            await token.burn(DECIMALS_MULTIPLIER);

            const ticketCount = await token.ticketCount();

            expect(ticketCount.toNumber()).to.equal(1);

            await advanceBlock(blocksTilLotto);

            const response = await token.rawFulfillRandomness(
                ethers.utils.randomBytes(32),
                (Math.random() * 100).toFixed(0),
            );

            const { logs } = await response.wait();
            logs.forEach((log, i) => {
                const {
                    name,
                    args: { to, tokenId },
                } = nft.interface.parseLog(log);

                expect(name).to.equal("Transfer");
                expect(to).to.equal(bagHolderAddress);
                expect(tokenId.toNumber()).to.equal(i);
            });

            expect(logs.length).to.equal(MAX_NFT_SUPPLY);
        });

        it("allows running lotto with many tickets", async function () {
            const signers = await ethers.getSigners();

            const burnFrom = async (signer: any): Promise<void> => {
                await token.transfer(signer.address, DECIMALS_MULTIPLIER);
                await token.connect(signer).burn(DECIMALS_MULTIPLIER);
            };

            const burnPromises = [];
            for (let i = 0; i < signers.length; i += 1) {
                burnPromises.push(burnFrom(signers[i]));
            }

            await Promise.all(burnPromises);

            const tokensBurnedPromises = [];
            for (let i = 0; i < signers.length; i += 1) {
                tokensBurnedPromises.push(token.burnedTokens(signers[i].address));
            }

            const tokensBurned = await Promise.all(tokensBurnedPromises);

            tokensBurned.forEach((burned: BigNumber) => expect(burned.gte(1)).to.equal(true));

            await advanceBlock(blocksTilLotto);

            const response = await token.rawFulfillRandomness(
                ethers.utils.randomBytes(32),
                (Math.random() * 100).toFixed(0),
            );

            const { logs } = await response.wait();
            const winners = logs.map((log, i) => {
                const {
                    name,
                    args: { to, tokenId },
                } = nft.interface.parseLog(log);

                expect(name).to.equal("Transfer");
                expect(tokenId.toNumber()).to.equal(i);

                return to;
            });

            // expect not all winners are the same
            expect(winners.some((winner, i) => winner !== winners[0] && i !== 0)).to.equal(true);
            expect(winners.length).to.equal(MAX_NFT_SUPPLY);
        });
    });
});
