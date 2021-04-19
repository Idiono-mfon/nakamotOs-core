/* eslint-disable func-names */
import { expect } from "chai";
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

    it("should have a total supply of 2100e18", async function () {
        expect((await token.totalSupply()).toString()).to.equal(MAX_SUPPLY.toString());
    });

    it("entire supply should be minted to bagHolder", async function () {
        expect((await token.balanceOf(bagHolderAddress)).toString()).to.equal(MAX_SUPPLY.toString());
    });

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

        expect((await token.burnedTokens(bagHolderAddress)).toString()).to.equal(burnAmount.mul(burnTimes).toString());
    });
});
