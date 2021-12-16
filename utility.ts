import {
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack,
} from "ethers/lib/utils";
import { ecsign } from "ethereumjs-util";

export const sign = (digest: string, privateKey: Buffer) => {
  return ecsign(Buffer.from(digest.slice(2), "hex"), privateKey);
};

// Gets the EIP712 domain separator
export function getDomainSeparator(
  name: string,
  version: string,
  contractAddress: string,
  chainId: number,
) {
  return keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256(
          toUtf8Bytes(
            "EIP712Domain(string name, string version, uint256 chainId, address verifyingContract)",
          ),
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes(version)),
        chainId,
        contractAddress,
      ],
    ),
  );
}

export const getTransactionData = async (
  nonce: number,
  functionSignature: any,
  publicKey: string,
  privateKey: string,
  contract: any,
) => {
  const digest = keccak256(
    solidityPack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        getDomainSeparator(
          contract.name,
          contract.version,
          contract.address,
          31337,
        ),
        keccak256(
          defaultAbiCoder.encode(
            ["uint256", "address", "bytes32"],
            [
              nonce,
              publicKey,
              keccak256(
                Buffer.from(functionSignature.replace("0x", ""), "hex"),
              ),
            ],
          ),
        ),
      ],
    ),
  );

  const signature = sign(digest, Buffer.from(privateKey, "hex"));

  return signature;
};
