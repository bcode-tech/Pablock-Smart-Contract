import { expect } from "chai";
import { ContractFactory, Contract, BigNumber } from "ethers";
import { ethers } from "hardhat";

import web3Abi from "web3-eth-abi";
import { getTransactionData } from "../utility";

import PablockMUltiSignFactoryArtifact from "../artifacts/contracts/pablock/PablockMultiSignFactory.sol/PablockMultiSignFactory.json";
import PablockMultiSignArtifact from "../artifacts/contracts/pablock/PablockMultiSignNotarization.sol/PablockMultiSignNotarization.json";

const PRIVATE_KEYS = [
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  "59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
];

describe("Pablock Smart Contracts", function () {
  let MetaTransaction, PablockToken, PablockMultiSignFactory: ContractFactory;

  let metaTransaction: Contract;
  let pablockToken: Contract;

  let pablockMultiSignFactory: Contract;

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
    PablockMultiSignFactory = await ethers.getContractFactory(
      "PablockMultiSignFactory",
    );

    metaTransaction = await MetaTransaction.deploy(addr1.address);

    await metaTransaction.deployed();

    if (metaTransaction.address) {
      pablockToken = await PablockToken.deploy(1000000000);
      await pablockToken.deployed();

      pablockMultiSignFactory = await PablockMultiSignFactory.deploy(
        pablockToken.address,
        metaTransaction.address,
      );
      await pablockMultiSignFactory.deployed();

      await metaTransaction.initialize(pablockToken.address);

      await pablockToken.addContractToWhitelist(
        pablockToken.address,
        1,
        3,
        addr1.address,
      );

      await pablockToken.addContractToWhitelist(
        pablockMultiSignFactory.address,
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

      /**
       * To unlockToken you need to pay 2 PTK
       */

      await pablockToken.addFunctionPrice(
        pablockMultiSignFactory.address, // @ts-ignore
        new ethers.utils.Interface(
          PablockMUltiSignFactoryArtifact.abi,
        ).getSighash("createNewMultiSignNotarization"),
        2,
      );
    }

    await pablockToken.requestToken(addr1.address, 1);
    await pablockToken.requestToken(addr2.address, 5);
    await pablockToken.requestToken(addr3.address, 1);
  });

  it("should be able to create a MultiSignature Contract", async () => {
    const [_, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

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
    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("2"));
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
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);

    const multiSignContract = new ethers.Contract(
      multiSignAddress,
      PablockMultiSignArtifact.abi,
    );
    await pablockToken.addContractToWhitelist(
      multiSignAddress,
      1,
      3,
      addr2.address,
    );

    await multiSignContract.connect(addr2).signDocument();
    const status = await multiSignContract
      .connect(addr2)
      .getSignerStatus(addr2.address);
    expect(status).to.be.equal(true);

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("1"));
  });
  it("should be possible to create multisigncontract with meta transaction", async () => {
    const [_, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const prevBalance: BigNumber = await pablockToken.balanceOf(addr2.address);
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

    const spend: BigNumber = prevBalance.sub(
      await pablockToken.balanceOf(addr2.address),
    );

    expect(spend).to.eq(ethers.utils.parseEther("2"));
  });
});
