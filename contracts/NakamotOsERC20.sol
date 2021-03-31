// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NakamotOsERC20 is ERC20 {
    event Burn(address indexed burner, uint256 amount);

    mapping(address => uint256) public nftClaims;
    address public nftTokenAddress;

    uint256 private DECIMAL_MULTIPLIER = 10 ** 18;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply,
        address bagHolder,
        address nftTokenAddress_
    ) ERC20(name_, symbol_) {
        _mint(bagHolder, maxSupply);
        nftTokenAddress = nftTokenAddress_;
    }

    modifier onlyNFT() {
        require(_msgSender() == nftTokenAddress, "Caller must be the NFT");
        _;
    }

    function burn(uint256 amount) external returns (bool) {
        _burn(_msgSender(), amount);
        nftClaims[_msgSender()] += amount;
        emit Burn(_msgSender(), amount);
        return true;
    }

    function claimNFT(uint amount, address minter) external onlyNFT returns (bool) {
        uint256 claimAmount = amount * DECIMAL_MULTIPLIER;

        require(nftClaims[minter] >= claimAmount);
        nftClaims[minter] -= claimAmount;
        return true;
    }
}
