// SPDX-License-Identifier: No License
pragma solidity 0.8.17;

contract RecipientExample {
    uint256 public calls;
    function getabcdefe() external returns (address){
        calls++;
        return _msgSender();
        // ... perform the purchase for sender
    }

    address immutable _trustedForwarder;
    constructor(address trustedForwarder) {
        _trustedForwarder = trustedForwarder;
    }

    function isTrustedForwarder(address forwarder) public view returns(bool) {
        return forwarder == _trustedForwarder;
    }

    function _msgSender() internal view returns (address payable signer) {
        signer = payable(msg.sender);
        if (msg.data.length>=20 && isTrustedForwarder(signer)) {
            assembly {
                signer := shr(96,calldataload(sub(calldatasize(),20)))
            }
        }    
    }
}