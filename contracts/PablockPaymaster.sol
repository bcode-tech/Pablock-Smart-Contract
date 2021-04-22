// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "@opengsn/gsn/contracts/forwarder/IForwarder.sol";
import "@opengsn/gsn/contracts/BasePaymaster.sol";

contract PablockPaymaster is BasePaymaster {

    event SampleRecipientPreCall();
    event SampleRecipientPostCall(bool success, uint actualCharge);


    function preRelayedCall(
        GsnTypes.RelayRequest calldata relayRequest,
        bytes calldata signature,
        bytes calldata approvalData,
        uint256 maxPossibleGas
    ) external override virtual returns (bytes memory, bool) {
        (signature);
        _verifyForwarder(relayRequest);
        (approvalData, maxPossibleGas);
        emit SampleRecipientPreCall();
        return ("no revert here",false);
    }

}

