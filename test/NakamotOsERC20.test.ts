/* eslint-disable func-names */
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";

import { NakamotOsERC20 } from "../typechain";
import { DECIMALS_MULTIPLIER, MAX_SUPPLY } from "../constants";
import setup from "./helpers/setup";

describe("ERC20", function () {
    let token: NakamotOsERC20;
    let bagHolderAddress: string;

    beforeEach(async function () {
        const deployment = await setup();
        token = deployment.token;
        bagHolderAddress = deployment.bagHolderAddress;
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

        it("allows running the lottery", async function () {
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

            const ticketCount = await token.ticketCount();

            console.log({ ticketCount });

            // await link.transfer(token.address, fee);
            const res = await token.rawFulfillRandomness(ethers.utils.randomBytes(32), "4230982");

            console.log({ res });
        });
    });
});
