import { Address } from "viem";

export const MAIN_AGGREGATOR_ADDRESS = (process.env.NEXT_PUBLIC_MAIN_AGGREGATOR || "") as Address;
export const GITCOIN_ADAPTER_ADDRESS = (process.env.NEXT_PUBLIC_GITCOIN_ADAPTER || "") as Address;
export const POH_ADAPTER_ADDRESS = (process.env.NEXT_PUBLIC_POH_ADAPTER || "") as Address;
export const BRIGHTID_ADAPTER_ADDRESS = (process.env.NEXT_PUBLIC_BRIGHTID_ADAPTER || "") as Address;

export const HMT_ADDRESS = (process.env.NEXT_PUBLIC_HMT_ADDRESS || "") as Address;
export const HMT_DECIMALS = Number(process.env.NEXT_PUBLIC_HMT_DECIMALS || 18);
export const HMT_SYMBOL = process.env.NEXT_PUBLIC_HMT_SYMBOL || "HMT";

export const VERIFY_AND_REGISTER_ABI = [
  {
    type: "function",
    name: "verifyAndRegister",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "proof", type: "bytes" },
    ],
    outputs: [],
  },
] as const;

export const ERC20_READ_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
] as const;

export const MAIN_AGGREGATOR_ABI = [
  { type: "function", name: "getVerificationCount", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isVerifiedHuman", stateMutability: "view", inputs: [{ name: "_address", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "getTrustScore", stateMutability: "view", inputs: [{ name: "_address", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getHumanProbability", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { 
    type: "function", 
    name: "sourceConfidences", 
    stateMutability: "view", 
    inputs: [{ name: "", type: "uint8" }], 
    outputs: [
      { name: "numerator", type: "uint256" }, 
      { name: "denominator", type: "uint256" }
    ] 
  },
  { 
    type: "function", 
    name: "sourceStats", 
    stateMutability: "view", 
    inputs: [{ name: "", type: "uint8" }], 
    outputs: [
      { name: "totalVerifications", type: "uint256" }, 
      { name: "confirmedAttacks", type: "uint256" }, 
      { name: "lastUpdate", type: "uint256" }
    ] 
  },
] as const;
