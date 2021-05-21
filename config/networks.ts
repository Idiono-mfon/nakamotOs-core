import { infuraApiKey, maticVigilApiKey } from "./env";

export enum ChainId {
    ganache = 1337,
    goerli = 5,
    hardhat = 31337,
    kovan = 42,
    mainnet = 1,
    matic = 137,
    mumbai = 80001,
    rinkeby = 4,
    ropsten = 3,
    xdai = 100,
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

// Matic
const maticVigilChains = ["matic", "mumbai"] as const;
type MaticVigilChain = typeof maticVigilChains[number];
const getMaticVigilConfig = (network: MaticVigilChain): { url: string; chainId: number } => {
    if (!maticVigilApiKey) {
        throw new Error("Please set your MATICVIGIL_API_KEY in a .env file");
    }
    return {
        url: `https://rpc-${network}.maticvigil.com/v1/${maticVigilApiKey}`,
        chainId: ChainId[network],
    };
};

// xDai
const xDaiChains = ["xdai"] as const;
type XDaiChain = typeof xDaiChains[number];
const getXDaiConfig = (network: XDaiChain): { url: string; chainId: number } => {
    return {
        url: `https://rpc.xdaichain.com/`,
        chainId: ChainId[network],
    };
};

export type RemoteChain = InfuraChain | MaticVigilChain | XDaiChain;
export const getRemoteNetworkConfig = (network: RemoteChain): { url: string; chainId: number } => {
    if (infuraChains.includes(network as InfuraChain)) return getInfuraConfig(network as InfuraChain);
    if (maticVigilChains.includes(network as MaticVigilChain)) return getMaticVigilConfig(network as MaticVigilChain);
    if (xDaiChains.includes(network as XDaiChain)) return getXDaiConfig(network as XDaiChain);
    throw Error("Unknown network");
};

interface networkInterface {
    [key: number]: Record<string, unknown>;
}

export const networkConfig: networkInterface = {
    0: {
        name: "hardhat",
        fee: "100000000000000000",
        keyHash: "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    },
    31337: {
        name: "localhost",
        fee: "100000000000000000",
        keyHash: "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
    },
    42: {
        name: "kovan",
        linkToken: "0xa36085F69e2889c224210F603D836748e7dC0088",
        ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
        keyHash: "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
        vrfCoordinator: "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9",
        oracle: "0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fee: "100000000000000000",
    },
    4: {
        name: "rinkeby",
        linkToken: "0x01be23585060835e02b77ef475b0cc51aa1e0709",
        ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
        keyHash: "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
        vrfCoordinator: "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
        oracle: "0x7AFe1118Ea78C1eae84ca8feE5C65Bc76CcF879e",
        jobId: "6d1bfe27e7034b1d87b5270556b17277",
        fee: "100000000000000000",
    },
    1: {
        name: "mainnet",
        linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
    },
    5: {
        name: "goerli",
        linkToken: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
    },
};

export function getNetworkIdFromName(networkIdName: string): string | undefined {
    return Object.keys(networkConfig).find((id: string) => {
        if (networkConfig[Number(id)].name === networkIdName) return id;
        return null;
    });
}
