import { encodeAbiParameters, parseAbiParameters } from "viem";

export function encodeGitcoinProof(data: { userId: `0x${string}`; score: bigint | number; timestamp: bigint | number; signature: `0x${string}` }) {
  return encodeAbiParameters(
    parseAbiParameters("bytes32, uint256, uint256, bytes"),
    [data.userId, BigInt(data.score), BigInt(data.timestamp), data.signature]
  );
}

export function encodePohProof(data: { pohId: `0x${string}`; timestamp: bigint | number; signature: `0x${string}` }) {
  return encodeAbiParameters(
    parseAbiParameters("bytes32, uint256, bytes"),
    [data.pohId, BigInt(data.timestamp), data.signature]
  );
}

export function encodeBrightIdProof(data: { contextId: `0x${string}`; timestamp: bigint | number; signature: `0x${string}` }) {
  return encodeAbiParameters(
    parseAbiParameters("bytes32, uint256, bytes"),
    [data.contextId, BigInt(data.timestamp), data.signature]
  );
}
