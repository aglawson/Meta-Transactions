// SPDX-License-Identifier: No License
pragma solidity 0.8.17;

contract RecipientExample {
    uint256 public calls;
    string public message = 'default message';
    address public latestSender;
    function getabcdefe() external returns (address){
        // require(isTrustedForwarder(_msgSender()), 'Sender is not trusted forwarder');
        calls++;
        latestSender = _msgSender();
        return _msgSender();
        // ... perform the purchase for sender
    }

    function writeMessage(string memory _message) external {
        latestSender = _msgSender();
        message = _message;
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
            return signer;
        } else {
            revert('invalid call');
        }
    }
}