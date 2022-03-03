import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import PablockNotarizationArtifact from "../artifacts/contracts/pablock/PablockNotarization.sol/PablockNotarization.json";

const PRIVATE_KEYS = [
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];

describe("Pablock Smart Contracts", function () {
  let MetaTransaction, PablockNotarization: ContractFactory;
  let PablockToken: ContractFactory;

  let metaTransaction: Contract;
  let pablockToken: Contract;
  let pablockNotarization: Contract;

  /**
   * addr0 will be the owner of all the contract
   * addr1 will be the payer of all the contract,
   * can execute meta transaction but can be replaced in case of misfunction
   * addr2 and addr3 will be users with PTK
   * addr4 will be a user without PTK
   */
  before(async () => {
    const [_, addr1, addr2, addr3] = await ethers.getSigners();

    MetaTransaction = await ethers.getContractFactory("EIP712MetaTransaction");
    PablockToken = await ethers.getContractFactory("PablockToken");
    PablockNotarization = await ethers.getContractFactory(
      "PablockNotarization",
    );

    metaTransaction = await MetaTransaction.deploy(addr1.address);

    await metaTransaction.deployed();

    if (metaTransaction.address) {
      pablockToken = await PablockToken.deploy(1000000000);
      await pablockToken.deployed();

      pablockNotarization = await PablockNotarization.deploy(
        pablockToken.address,
        metaTransaction.address,
        addr1.address,
      );
      await pablockNotarization.deployed();

      await metaTransaction.initialize(pablockToken.address);

      await pablockToken.addContractToWhitelist(
        pablockToken.address,
        1,
        3,
        addr1.address,
      );
      await pablockToken.addContractToWhitelist(
        pablockNotarization.address,
        1,
        3,
        addr1.address,
      );

      await pablockToken.addContractToWhitelist(
        metaTransaction.address,
        1,
        3,
        addr1.address,
      );
    }

    await pablockToken.requestToken(addr1.address, 1);
    await pablockToken.requestToken(addr2.address, 15);
    await pablockToken.requestToken(addr3.address, 1);
  });

  it("should notarize directly", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

    await pablockNotarization
      .connect(addr2)
      .notarize(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr2.address,
        "",
      );

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
  it("should notarize directly through payer without paying", async () => {
    const [_, addr1] = await ethers.getSigners();

    await pablockNotarization
      .connect(addr1)
      .notarize(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr1.address,
        "",
      );

    const currentBalance: BigNumber = await pablockToken.balanceOf(
      addr1.address,
    );

    expect(currentBalance).to.eq(ethers.utils.parseEther("1"));
  });
  it("should not notarize directly", async () => {
    const addr4 = (await ethers.getSigners())[4];

    await expect(
      pablockNotarization
        .connect(addr4)
        .notarize(
          "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
          "",
          addr4.address,
          "",
        ),
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });
  it("should notarize with meta transaction through owner", async () => {
    const [addr0, addr1, addr2] = await ethers.getSigners();

    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNotarizationArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "notarize",
      ),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr2.address,
        "",
      ],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNotarization",
        version: "0.1.1",
        address: pablockNotarization.address,
      },
    );

    await metaTransaction
      .connect(addr0)
      .executeMetaTransaction(
        pablockNotarization.address,
        addr2.address,
        functionSignature,
        r,
        s,
        v,
      );

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
  it("should notarize with meta transaction through payer", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);
    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNotarizationArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "notarize",
      ),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr2.address,
        "",
      ],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNotarization",
        version: "0.1.1",
        address: pablockNotarization.address,
      },
    );

    await metaTransaction
      .connect(addr1)
      .executeMetaTransaction(
        pablockNotarization.address,
        addr2.address,
        functionSignature,
        r,
        s,
        v,
      );

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
  it("should revoke access to payer", async () => {
    const addr1 = (await ethers.getSigners())[1];
    const PAYER_ROLE = await pablockNotarization.PAYER_ROLE();

    await expect(
      pablockNotarization.revokeRole(PAYER_ROLE, addr1.address),
    ).emit(pablockNotarization, "RoleRevoked");
  });
  it("should notarize directly through payer paying", async () => {
    const [_, addr1] = await ethers.getSigners();
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr1.address);
    await pablockNotarization
      .connect(addr1)
      .notarize(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr1.address,
        "ADDR4",
      );

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr1.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
  it("should paused pablockToken contract", async () => {
    await expect(pablockToken.setPauseStatus(true)).emit(
      pablockToken,
      "Paused",
    );
  });

  it("should failed to update pablockToken contract", async () => {
    await expect(
      pablockToken.removeContractFromWhitelist(pablockNotarization.address),
    ).to.be.revertedWith("Not allowed");
  });

  it("should notarize directly", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    await expect(
      pablockNotarization
        .connect(addr2)
        .notarize(
          "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
          "",
          addr2.address,
          "",
        ),
    ).to.be.revertedWith("Contract not allowed");
  });

  it("should block payer to execute metatransaction", async () => {
    const [_, addr1] = await ethers.getSigners();

    await expect(
      metaTransaction.revokeRole(
        await metaTransaction.PAYER_ROLE(),
        addr1.address,
      ),
    ).emit(metaTransaction, "RoleRevoked");
  });

  it("should notarize with meta transaction through payer", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNotarizationArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "notarize",
      ),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr2.address,
        "",
      ],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNotarization",
        version: "0.1.1",
        address: pablockNotarization.address,
      },
    );

    await expect(
      metaTransaction
        .connect(addr1)
        .executeMetaTransaction(
          pablockNotarization.address,
          addr2.address,
          functionSignature,
          r,
          s,
          v,
        ),
    ).to.be.revertedWith("Not allowed to execute meta transaction");
  });
  it("should deloy different PablockToken", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();
    const prevPablockTokenAddress = pablockToken.address;
    pablockToken = await PablockToken.deploy(1000000000);
    await pablockToken.deployed();

    await pablockToken.addContractToWhitelist(
      pablockNotarization.address,
      1,
      3,
      addr1.address,
    );

    await pablockToken.addContractToWhitelist(
      metaTransaction.address,
      1,
      3,
      addr1.address,
    );

    await pablockToken.requestToken(addr2.address, 10);
    expect(prevPablockTokenAddress).not.equal(pablockToken.address);
  });
  it("should initialize and notarize with metatx", async () => {
    const [addr0, _1, addr2] = await ethers.getSigners();

    let tx = await pablockNotarization.initialize(pablockToken.address);
    await tx.wait();
    tx = await metaTransaction.initialize(pablockToken.address);
    await tx.wait();

    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNotarizationArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "notarize",
      ),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr2.address,
        "",
      ],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNotarization",
        version: "0.1.1",
        address: pablockNotarization.address,
      },
    );

    await metaTransaction
      .connect(addr0)
      .executeMetaTransaction(
        pablockNotarization.address,
        addr2.address,
        functionSignature,
        r,
        s,
        v,
      );

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
});
