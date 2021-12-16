import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import PablockNotarizationArtifact from "../artifacts/contracts/pablock/PablockNotarization.sol/PablockNotarization.json";
import PablockNFTArtifact from "../artifacts/contracts/pablock/PablockNFT.sol/PablockNFT.json";
import PablockMUltiSignFactoryArtifact from "../artifacts/contracts/pablock/PablockMultiSignFactory.sol/PablockMultiSignFactory.json";
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
    PablockNFT = await ethers.getContractFactory("PablockNFT");
    PablockMultiSignFactory = await ethers.getContractFactory(
      "PablockMultiSignFactory",
    );

    metaTransaction = await MetaTransaction.deploy(
      "PablockMetaTransaction",
      "0.1.0",
      addr1.address,
    );

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

      /**
       * To unlockToken you need to pay 2 PTK
       */
      await pablockToken.addFunctionPrice(
        pablockNFT.address, // @ts-ignore
        new ethers.utils.Interface(PablockNFTArtifact.abi).getSighash(
          "unlockToken",
        ),
        2,
      );
      await pablockToken.addFunctionPrice(
        pablockMultiSignFactory.address, // @ts-ignore
        new ethers.utils.Interface(
          PablockMUltiSignFactoryArtifact.abi,
        ).getSighash("createNewMultiSignNotarization"),
        2,
      );
    }

    await pablockToken.requestToken(addr1.address, 1);
    await pablockToken.requestToken(addr2.address, 15);
    await pablockToken.requestToken(addr3.address, 1);
  });

  it("should notarize directly", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    await pablockNotarization
      .connect(addr2)
      .notarize(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr2.address,
        "",
      );

    const currentBalance: BigNumber = await pablockToken.balanceOf(
      addr2.address,
    );

    expect(currentBalance).to.eq(ethers.utils.parseEther("14"));
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

    const currentBalance = await pablockToken.balanceOf(addr2.address);

    expect(currentBalance).to.eq(ethers.utils.parseEther("13"));
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

    const currentBalance = await pablockToken.balanceOf(addr2.address);

    expect(currentBalance).to.eq(ethers.utils.parseEther("12"));
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

    await pablockNotarization
      .connect(addr1)
      .notarize(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        "",
        addr1.address,
        "ADDR4",
      );

    const currentBalance: BigNumber = await pablockToken.balanceOf(
      addr1.address,
    );

    expect(currentBalance).to.eq(ethers.utils.parseEther("0"));
  });

  it("should not mint an NFT", async () => {
    const addr4 = (await ethers.getSigners())[4];

    await expect(
      pablockNFT.connect(addr4).mintToken(addr4.address, 1, "prova"),
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });
  it("should be possible to mint an NFT", async () => {
    const addr2 = (await ethers.getSigners())[2];

    await expect(
      pablockNFT.connect(addr2).mintToken(addr2.address, 1, "Prova"),
    ).emit(pablockNFT, "TokenGeneration");

    const numNFTAfter = await pablockNFT.balanceOf(addr2.address);
    const currentBalance = await pablockToken.balanceOf(addr2.address);

    expect(numNFTAfter).equal(1);
    expect(currentBalance).to.eq(ethers.utils.parseEther("11"));
  });
  it("should mint NFT with meta transaction through payer", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNFTArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "mintToken",
      ),
      [addr2.address, 1, "Prova2"],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNFT",
        version: "0.2.1",
        address: pablockNFT.address,
      },
    );

    await expect(
      metaTransaction
        .connect(addr1)
        .executeMetaTransaction(
          pablockNFT.address,
          addr2.address,
          functionSignature,
          r,
          s,
          v,
        ),
    ).emit(pablockNFT, "TokenGeneration");

    const currentBalance = await pablockToken.balanceOf(addr2.address);

    expect(currentBalance).to.eq(ethers.utils.parseEther("10"));
  });
  it("should unlock token", async () => {
    const addr2 = (await ethers.getSigners())[2];

    tokenId = await pablockNFT.tokenOfOwnerByIndex(addr2.address, 0);

    await pablockNFT.connect(addr2).unlockToken(tokenId);

    const isUnlocked = await pablockNFT.isUnlocked(tokenId);

    expect(isUnlocked).equal(true);

    expect(await pablockToken.balanceOf(addr2.address)).to.eq(
      ethers.utils.parseEther("8"),
    );
  });
  it("should be possible to transfer an NFT", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    await expect(
      pablockNFT
        .connect(addr2)
        .transferFrom(addr2.address, addr1.address, tokenId),
    ).emit(pablockNFT, "Transfer");

    const owner = await pablockNFT.ownerOf(tokenId);
    expect(owner).eq(addr1.address);

    /**
     * Equals to 8 because we are transfering an unlocked token, so we don't spend PTK
     */
    const currentBalance = await pablockToken.balanceOf(addr2.address);
    expect(currentBalance).to.eq(ethers.utils.parseEther("8"));
  });
  it("should be possible to transfer an NFT with meta transaction", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    tokenId = await pablockNFT.tokenOfOwnerByIndex(addr2.address, 0);

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNFTArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "transferFrom",
      ),
      [addr2.address, addr1.address, tokenId],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNFT",
        version: "0.2.1",
        address: pablockNFT.address,
      },
    );

    await expect(
      metaTransaction
        .connect(addr1)
        .executeMetaTransaction(
          pablockNFT.address,
          addr2.address,
          functionSignature,
          r,
          s,
          v,
        ),
    ).emit(pablockNFT, "Transfer");

    const owner = await pablockNFT.ownerOf(tokenId);
    expect(owner).eq(addr1.address);

    const currentBalance = await pablockToken.balanceOf(addr2.address);
    expect(currentBalance).to.eq(ethers.utils.parseEther("7"));
  });
  it("should be able to create a MultiSignature Contract", async () => {
    const [_, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const tx = await pablockMultiSignFactory
      .connect(addr2)
      .createNewMultiSignNotarization(
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        [addr2.address, addr3.address, addr4.address],
        "prova",
        100000,
      );

    const res = await tx.wait();

    multiSignAddress = res.events[2].args.multiSignAddress;

    expect(res.events[2].event).equal("NewPablockMultiSignNotarization");
    const currentBalance = await pablockToken.balanceOf(addr2.address);
    expect(currentBalance).to.eq(ethers.utils.parseEther("5"));
  });

  it("should not be possible to create a MultiSignature Contract without paying tokens", async () => {
    const [_, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    await expect(
      pablockMultiSignFactory
        .connect(addr4)
        .createNewMultiSignNotarization(
          "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
          [addr2.address, addr3.address, addr4.address],
          "prova",
          100000,
        ),
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });

  it("should sign document", async () => {
    const addr2 = (await ethers.getSigners())[2];

    const multiSignContract = new ethers.Contract(
      multiSignAddress,
      PablockMultiSignArtifact.abi,
    );
    await pablockToken.addContractToWhitelist(multiSignAddress, 1, 3);

    await multiSignContract.connect(addr2).signDocument();
    const status = await multiSignContract
      .connect(addr2)
      .getSignerStatus(addr2.address);
    expect(status).to.be.equal(true);

    const currentBalance = await pablockToken.balanceOf(addr2.address);
    expect(currentBalance).to.eq(ethers.utils.parseEther("4"));
  });
  it("should be possible to create multisigncontract with meta transaction", async () => {
    const [_, addr1, addr2, addr3, addr4] = await ethers.getSigners();

    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockMUltiSignFactoryArtifact.abi.find(
        (el: any) =>
          el.type === "function" &&
          el.name === "createNewMultiSignNotarization",
      ),
      [
        "0xb133a0c0e9bee3be20163d2ad31d6248db292aa6dcb1ee087a2aa50e0fc75ae2",
        [addr2.address, addr3.address, addr4.address],
        "prova",
        100000,
      ],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockMultiSignFactory",
        version: "0.1.1",
        address: pablockMultiSignFactory.address,
      },
    );

    // const tx = await metaTransaction
    //   .connect(addr1)
    //   .executeMetaTransaction(
    //     pablockMultiSignFactory.address,
    //     addr2.address,
    //     functionSignature,
    //     r,
    //     s,
    //     v,
    //   );

    // const res = await tx.wait();

    // multiSignAddress = res.events[2].args.multiSignAddress;
    await expect(
      metaTransaction
        .connect(addr1)
        .executeMetaTransaction(
          pablockMultiSignFactory.address,
          addr2.address,
          functionSignature,
          r,
          s,
          v,
        ),
    ).emit(pablockMultiSignFactory, "NewPablockMultiSignNotarization");

    // expect(res.events[2].event).equal("NewPablockMultiSignNotarization");
    const currentBalance = await pablockToken.balanceOf(addr2.address);
    expect(currentBalance).to.eq(ethers.utils.parseEther("2"));
  });

  it("should paused pablockToken contract", async () => {
    await expect(pablockToken.setPauseStatus(true)).emit(
      pablockToken,
      "Paused",
    );
  });

  it("should failed to update pablockToken contract", async () => {
    await expect(
      pablockToken.removeContractFromWhitelist(pablockNFT.address),
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
});
