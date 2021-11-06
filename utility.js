const {
  keccak256,
  defaultAbiCoder,
  toUtf8Bytes,
  solidityPack,
} = require("ethers/lib/utils");
const { ecsign } = require("ethereumjs-util");

const sign = (digest, privateKey) => {
  return ecsign(Buffer.from(digest.slice(2), "hex"), privateKey);
};

const PERMIT_TYPEHASH = keccak256(
  toUtf8Bytes(
    "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
  )
);

const TRANSFER_TYPEHASH = keccak256(
  toUtf8Bytes("Transfer(address from,address to,uint256 amount)")
);

// Returns the EIP712 hash which should be signed by the user
// in order to make a call to `permit`
function getPermitDigest(name, address, chainId, approve, nonce, deadline) {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, address, chainId);

  return keccak256(
    solidityPack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256", "uint256", "uint256"],
            [
              PERMIT_TYPEHASH,
              approve.owner,
              approve.spender,
              approve.value,
              nonce,
              deadline,
            ]
          )
        ),
      ]
    )
  );
}

function getTransferDigest(name, address, chainId, transfer, nonce) {
  const DOMAIN_SEPARATOR = getDomainSeparator(name, address, chainId);

  return keccak256(
    solidityPack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        DOMAIN_SEPARATOR,
        keccak256(
          defaultAbiCoder.encode(
            ["bytes32", "address", "address", "uint256", "uint256"],
            [
              TRANSFER_TYPEHASH,
              transfer.from,
              transfer.to,
              transfer.amount,
              nonce,
            ]
          )
        ),
      ]
    )
  );
}

// Gets the EIP712 domain separator
function getDomainSeparator(name, contractAddress, chainId) {
  return keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32", "bytes32", "uint256", "address"],
      [
        keccak256(
          toUtf8Bytes(
            "EIP712Domain(string name, string version, uint256 chainId, address verifyingContract)"
          )
        ),
        keccak256(toUtf8Bytes(name)),
        keccak256(toUtf8Bytes("0.1.0")),
        chainId,
        contractAddress,
      ]
    )
  );
}

const getTransactionData = async (
  nonce,
  functionSignature,
  publicKey,
  privateKey,
  contract
) => {
  const digest = keccak256(
    solidityPack(
      ["bytes1", "bytes1", "bytes32", "bytes32"],
      [
        "0x19",
        "0x01",
        getDomainSeparator(contract.name, contract.address, 1),
        keccak256(
          defaultAbiCoder.encode(
            ["uint256", "address", "bytes32"],
            [
              nonce,
              publicKey,
              keccak256(
                Buffer.from(functionSignature.replace("0x", ""), "hex")
              ),
            ]
          )
        ),
      ]
    )
  );

  const signature = sign(digest, Buffer.from(privateKey, "hex"));

  // let r = signature.slice(0, 66);
  // let s = "0x".concat(signature.slice(66, 130));
  // let v = "0x".concat(signature.slice(130, 132));
  // v = web3.utils.hexToNumber(v);
  // if (![27, 28].includes(v)) v += 27;

  return {
    // r,
    // s,
    // v,
    ...signature,
    functionSignature,
  };
};

module.exports = {
  sign,
  PERMIT_TYPEHASH,
  getPermitDigest,
  getTransferDigest,
  getDomainSeparator,
  getTransactionData,
};
