import { ethers } from "hardhat";

export const DECIMALS_MULTIPLIER = ethers.BigNumber.from(10).pow(18);
export const MAX_SUPPLY = DECIMALS_MULTIPLIER.mul(2100);
export const NAME = "Nakamot-Os";
export const SYMBOL = "BOX";
export const NFT_URI = "https://arweave.net/blahblahblah";
export const MAX_NFT_SUPPLY = 210;
