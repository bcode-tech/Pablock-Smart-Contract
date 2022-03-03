import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import PablockNFTArtifact from "../artifacts/contracts/pablock/PablockNFT.sol/PablockNFT.json";

const PRIVATE_KEYS = [
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];

describe("PablockERC721 Contract", function () {
  let MetaTransaction, PablockToken, PablockNFT: ContractFactory;

  let metaTransaction: Contract;
  let pablockToken: Contract;
  let pablockNFT: Contract;

  let tokenId: number;

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

    PablockNFT = await ethers.getContractFactory("PablockNFT");

    metaTransaction = await MetaTransaction.deploy(addr1.address);

    await metaTransaction.deployed();

    if (metaTransaction.address) {
      pablockToken = await PablockToken.deploy(1000000000);
      await pablockToken.deployed();

      pablockNFT = await PablockNFT.deploy(
        "PablockNFT",
        "PTNFT",
        pablockToken.address,
        metaTransaction.address,
      );
      await pablockNFT.deployed();

      await metaTransaction.initialize(pablockToken.address);

      await pablockToken.addContractToWhitelist(
        pablockNFT.address,
        1,
        3,
        _.address,
      );
      await pablockToken.addContractToWhitelist(
        metaTransaction.address,
        1,
        3,
        _.address,
      );

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
        pablockNFT.address, // @ts-ignore
        new ethers.utils.Interface(PablockNFTArtifact.abi).getSighash(
          "mintToken",
        ),
        10,
      );
    }

    await pablockToken.requestToken(addr1.address, 1);
    await pablockToken.requestToken(addr2.address, 25);
    await pablockToken.requestToken(addr3.address, 1);
  });

  it("should not mint an NFT", async () => {
    const addr4 = (await ethers.getSigners())[4];

    await expect(
      pablockNFT.connect(addr4).mintToken(addr4.address, "prova"),
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });
  it("should be possible to mint an NFT", async () => {
    const addr2 = (await ethers.getSigners())[2];

    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

    await expect(
      pablockNFT.connect(addr2).mintToken(addr2.address, "Prova"),
    ).emit(pablockNFT, "TokenGeneration");

    const numNFTAfter = await pablockNFT.balanceOf(addr2.address);

    expect(numNFTAfter).equal(1);

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("10"));
  });
  it("should mint NFT with meta transaction through payer", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);
    // @ts-ignore
    const functionSignature = web3Abi.encodeFunctionCall(
      PablockNFTArtifact.abi.find(
        (el: any) => el.type === "function" && el.name === "mintToken",
      ),
      [addr2.address, "Prova2"],
    );

    const nonce = await metaTransaction.getNonce(addr2.address);

    const { r, s, v } = await getTransactionData(
      nonce.toNumber(),
      functionSignature,
      addr2.address,
      PRIVATE_KEYS[2],
      {
        name: "PablockNFT",
        version: "0.2.2",
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

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("10"));
  });
  it("should unlock token", async () => {
    const addr2 = (await ethers.getSigners())[2];
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

    tokenId = await pablockNFT.tokenOfOwnerByIndex(addr2.address, 0);

    await pablockNFT.connect(addr2).unlockToken(tokenId);

    const isUnlocked = await pablockNFT.isUnlocked(tokenId);

    expect(isUnlocked).equal(true);

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("2"));
  });
  it("should be possible to transfer an NFT", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);
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

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("0"));
  });
  it("should be possible to transfer an NFT with meta transaction", async () => {
    const [_, addr1, addr2] = await ethers.getSigners();

    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

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
        version: "0.2.2",
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

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
});
