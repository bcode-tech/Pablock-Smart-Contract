import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import PablockNotarizationArtifact from "../artifacts/contracts/pablock/PablockNotarization.sol/PablockNotarization.json";
import PablockMultiSignArtifact from "../artifacts/contracts/pablock/PablockMultiSignNotarization.sol/PablockMultiSignNotarization.json";

const PRIVATE_KEYS = [
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];

describe("Pablock Smart Contracts", function () {
  let MetaTransaction,
    PablockToken,
    PablockNotarization,
    PablockNFT,
    PablockMultiSignFactory: ContractFactory;

  let metaTransaction: Contract;
  let pablockToken: Contract;
  let pablockNotarization: Contract;
  let pablockNFT: Contract;
  let pablockMultiSignFactory: Contract;

  let tokenId: number;
  let multiSignAddress: string;

  before(async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    MetaTransaction = await ethers.getContractFactory("EIP712MetaTransaction");
    PablockToken = await ethers.getContractFactory("PablockToken");
    PablockNotarization = await ethers.getContractFactory(
      "PablockNotarization",
    );
    PablockNFT = await ethers.getContractFactory("PablockNFT");
    PablockMultiSignFactory = await ethers.getContractFactory(
      "PablockMultiSignFactory",
    );

    metaTransaction = await MetaTransaction.deploy(
      "PablockMetaTransaction",
      "0.1.0",
    );

    await metaTransaction.deployed();

    if (metaTransaction.address) {
      pablockToken = await PablockToken.deploy(
        1000000000,
        metaTransaction.address,
      );
      await pablockToken.deployed();

      pablockNotarization = await PablockNotarization.deploy(
        pablockToken.address,
        metaTransaction.address,
      );
      await pablockNotarization.deployed();

      pablockNFT = await PablockNFT.deploy(
        "PablockNFT",
        "PTNFT",
        pablockToken.address,
        metaTransaction.address,
      );
      await pablockNFT.deployed();

      pablockMultiSignFactory = await PablockMultiSignFactory.deploy(
        pablockToken.address,
        metaTransaction.address,
      );
      await pablockMultiSignFactory.deployed();

      await metaTransaction.initialize(pablockToken.address);

      await pablockToken.addContractToWhitelist(pablockToken.address, 1, 3);
      await pablockToken.addContractToWhitelist(
        pablockNotarization.address,
        1,
        3,
      );

      await pablockToken.addContractToWhitelist(pablockNFT.address, 1, 3);
      await pablockToken.addContractToWhitelist(
        pablockMultiSignFactory.address,
        1,
        3,
      );
      await pablockToken.addContractToWhitelist(metaTransaction.address, 1, 3);
    }

    const balance: BigNumber = await pablockToken.balanceOf(addr1.address);

    if (balance.lt(15)) {
      await pablockToken.requestToken(addr1.address, balance.sub(15).abs());
      await pablockToken.requestToken(addr2.address, 1);
    }
  });

  it("should notarize with directly", async () => {
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

    expect(currentBalance).to.eq(ethers.utils.parseEther("14"));
  });
  it("should notarize with meta transaction", async () => {
    const [_, addr1] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNotarizationArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "notarize",
      ),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr1.address,
        "",
      ],
    );

    const nonce = await metaTransaction.getNonce(addr1.address);

    let { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr1.address,
      PRIVATE_KEYS[1],
      {
        name: "PablockNotarization",
        version: "0.1.0",
        address: pablockNotarization.address,
      },
    );

    await metaTransaction.executeMetaTransaction(
      pablockNotarization.address,
      addr1.address,
      functionSignature,
      r,
      s,
      v,
    );

    const currentBalance = await pablockToken.balanceOf(addr1.address);

    expect(currentBalance).to.eq(ethers.utils.parseEther("13"));
  });

  it("should not mint an NFT", async () => {
    const [_, addr1] = await ethers.getSigners();

    await pablockNFT.connect(addr1).mintToken(addr1.address, 1, "prova");
  });
  it("should be possible to mint an NFT", async () => {
    const [_, addr1] = await ethers.getSigners();

    const numNFTBefore = await pablockNFT.balanceOf(addr1.address);
    const tokenBalanceBefore = await pablockToken.balanceOf(addr1.address);

    await pablockToken.requestToken(addr1.address, 10);

    await pablockNFT.connect(addr1).mintToken(addr1.address, 1, "prova");

    const numNFTAfter = await pablockNFT.balanceOf(addr1.address);
    const tokenBalanceAfter = await pablockToken.balanceOf(addr1.address);

    expect(numNFTBefore).not.equal(numNFTAfter);
    expect(tokenBalanceBefore).not.equal(tokenBalanceAfter);
  });
  it("should unlock token", async () => {
    const [_, addr1] = await ethers.getSigners();

    tokenId = await pablockNFT.tokenOfOwnerByIndex(addr1.address, 0);

    await pablockNFT.connect(addr1).unlockToken(tokenId);

    const isUnlocked = await pablockNFT.isUnlocked(tokenId);

    expect(isUnlocked).equal(true);
  });
  it("should be possible to transfer an NFT", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    await pablockNFT
      .connect(addr1)
      .transferFrom(addr1.address, addr2.address, tokenId);

    const recipientBalance = await pablockNFT.balanceOf(addr2.address);

    expect(recipientBalance).eq(1);
  });

  it("should be able to create a MultiSignature Contract", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    const tx = await pablockMultiSignFactory
      .connect(addr1)
      .createNewMultiSignNotarization(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        [addr1.address, addr2.address],
        "prova",
        100000,
      );

    const res = await tx.wait();

    multiSignAddress = res.events[1].args.multiSignAddress;

    expect(res.events[1].event).equal("NewPablockMultiSignNotarization");
  });

  it("should not be possible to create a MultiSignature Contract without paying tokens", async () => {
    const [_, addr1, addr2, addr3] = await ethers.getSigners();
    await expect(
      pablockMultiSignFactory
        .connect(addr3)
        .createNewMultiSignNotarization(
          "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
          [addr3.address, addr2.address],
          "prova",
          100000,
        ),
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });

  it("should sign document", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    const multiSignContract = new ethers.Contract(
      multiSignAddress,
      PablockMultiSignArtifact.abi,
    );
    await pablockToken.addContractToWhitelist(multiSignAddress, 1, 3);

    await multiSignContract.connect(addr2).signDocument();

    const status = await multiSignContract
      .connect(addr2)
      .getSignerStatus(addr2.address);

    expect(status).equal(true);
  });
});
