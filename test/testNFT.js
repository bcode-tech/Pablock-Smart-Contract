// var PablockToken = artifacts.require("./PablockToken.sol");
// var PablockNFT = artifacts.require("./PablockNFT.sol");

// contract("PablockToken", function (accounts) {
//   it("should have 3 token", function () {
//     return PablockToken.deployed(10000)
//       .then(async function (instance) {
//         await instance.requestToken(accounts[0], 1);
//         await PablockNFT.deployed("PablockNFT", "PTNFT", instance.address).then(
//           async (instance) => {
//             await instance.generateToken(1, "prova", {
//               from: accounts[0],
//             });
//           }
//         );
//         console.log(
//           "BALANCE ==>",
//           (await instance.balanceOf(accounts[0])).toString()
//         );
//         return (await instance.balanceOf(accounts[0])).toString();
//       })
//       .then(function (balance) {
//         assert.equal(balance, "0", "2 wasn't in the second account");
//       });
//   });
// });
