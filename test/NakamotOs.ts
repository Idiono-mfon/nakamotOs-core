/* eslint-disable func-names */
import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { NakamotOs } from "../typechain";
import { deploy } from "./helpers";
import { DECIMALS, MAX_SUPPLY } from "../config";

const setup = deployments.createFixture(async () => {
    const admin = await ethers.getNamedSigner("admin");
    const bagHolderAddress = await admin.getAddress();
    const token = (await deploy("NakamotOs", {
        args: ["NakamotOs", "BKFST", MAX_SUPPLY, await admin.getAddress()],
        connect: admin,
    })) as NakamotOs;

    return {
        token,
        bagHolderAddress,
    };
});

describe("Unit tests", function () {
    describe("Greeter", function () {
        let token: NakamotOs;
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
            const burnAmount = DECIMALS.mul(10);
            await token.burn(burnAmount);
            const expectedAmountLeft = MAX_SUPPLY.sub(burnAmount);

            expect((await token.balanceOf(bagHolderAddress)).toString()).to.equal(expectedAmountLeft.toString());

            expect((await token.totalSupply()).toString()).to.equal(expectedAmountLeft.toString());
        });
    });
});
