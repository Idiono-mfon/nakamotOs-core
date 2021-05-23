import { infuraApiKey } from "./env";
import { DECIMALS_MULTIPLIER } from "../constants";

export enum ChainId {
    ganache = 1337,
    goerli = 5,
    hardhat = 31337,
    kovan = 42,
    mainnet = 1,
    rinkeby = 4,
    ropsten = 3,
}

// Delegate requests for a network config to a provider specific function based on which networks they serve

// Ethereum
const infuraChains = ["goerli", "kovan", "mainnet", "rinkeby", "ropsten"] as const;
type InfuraChain = typeof infuraChains[number];
const getInfuraConfig = (network: InfuraChain): { url: string; chainId: number } => {
    if (!process.env.INFURA_API_KEY) {
        throw new Error("Please set your INFURA_API_KEY in a .env file");
    }
    return {
        url: `https://${network}.infura.io/v3/${infuraApiKey}`,
        chainId: ChainId[network],
    };
};

export type RemoteChain = InfuraChain;
export const getRemoteNetworkConfig = (network: RemoteChain): { url: string; chainId: number } => {
    if (infuraChains.includes(network as InfuraChain)) return getInfuraConfig(network as InfuraChain);

    throw Error("Unknown network");
};

interface networkInterface {
    [key: number]: Record<string, unknown>;
}

export const networkConfig: networkInterface = {
    31337: {
        name: "hardhat",
        keyHash: "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
        fee: DECIMALS_MULTIPLIER.div(10),
    },
    42: {
        name: "kovan",
        linkToken: "0xa36085F69e2889c224210F603D836748e7dC0088",
        keyHash: "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
        vrfCoordinator: "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9",
        fee: DECIMALS_MULTIPLIER.div(10),
    },
    4: {
        name: "rinkeby",
        linkToken: "0x01be23585060835e02b77ef475b0cc51aa1e0709",
        keyHash: "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
        vrfCoordinator: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
        fee: DECIMALS_MULTIPLIER.div(10),
    },
    1: {
        name: "mainnet",
        linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
        vrfCoordinator: "0xf0d54349aDdcf704F77AE15b96510dEA15cb7952",
        keyHash: "0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445",
        fee: DECIMALS_MULTIPLIER.mul(2),
    },
};

export function getNetworkIdFromName(networkIdName: string): string | undefined {
    return Object.keys(networkConfig).find((id: string) => {
        if (networkConfig[Number(id)].name === networkIdName) return id;
        return null;
    });
}
