import { ethers } from "hardhat";

export const DECIMALS_MULTIPLIER = ethers.BigNumber.from(10).pow(18);
export const MAX_SUPPLY = DECIMALS_MULTIPLIER.mul(500);
export const NAME = "Nakamot-Os";
export const SYMBOL = "BOX";
export const NFT_URI = "https://arweave.net/w8Vs3I-TmRIcZVNaSkxjVhtWc9ZJleCJeSRlpXEVdPM";
export const NFT_SUPPLY = 10;
export const BLOCKS_TIL_LOTTO = 69420; // about 1.5 weeks
