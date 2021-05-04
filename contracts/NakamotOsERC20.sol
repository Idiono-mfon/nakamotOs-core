// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "./NakamotOsERC721.sol";

contract NakamotOsERC20 is ERC20, VRFConsumerBase {
    using SafeMath for uint256;

    event Burn(address indexed burner, uint256 amount);

    mapping (address => uint256) public burnedTokens;

    NakamotOsERC721 public nftToken;

    uint256 public maxNFTSupply;

    uint256 public ONE = 10 ** 18;

    bytes32 private keyHash;

    // TODO: number of blocks since launch required for lottery call
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply,
        address bagHolder,
        address nftTokenAddress_,
        uint256 maxNFTSupply_,
        bytes32 keyHash_,
        address vrfCoordinator,
        address linkToken
    )
        public
        ERC20(name_, symbol_)
        VRFConsumerBase(vrfCoordinator, linkToken)
    {
        _mint(bagHolder, maxSupply);
        nftToken = NakamotOsERC721(nftTokenAddress_);
        maxNFTSupply = maxNFTSupply_;
        keyHash = keyHash_;
    }

    // add burner to an enumerable set
    // only add to enumberable set if less than lotto block
    function burn(uint256 amount) external returns (bool) {
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount);
        burnedTokens[_msgSender()] = burnedTokens[_msgSender()].add(amount);

        uint256 nftSupply = nftToken.totalSupply();
        if (nftSupply < maxNFTSupply) {
            uint256 mintAmount = amount.div(ONE);
            uint256 newNFTSupply = mintAmount.add(nftSupply);
            if (newNFTSupply > maxNFTSupply) {
                mintAmount = mintAmount.sub(newNFTSupply.sub(maxNFTSupply));
            }

            nftToken.mint(_msgSender(), mintAmount);
        }

        return true;
    }

    // function for lotto call after block

    // function to receive randomness
}
