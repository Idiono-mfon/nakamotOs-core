// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NakamotOs is ERC20 {
    event Burn(address indexed burner, uint256 amount);
    event Claim(address indexed claimer, uint256 amount)

    public mapping(address => uint256) nftClaims;
    public address nftTokenAddress;

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
        require(_msgSender() === nftTokenAddress, "Caller must be the NFT");
        _;
    }

    function burn(uint256 amount) external returns (bool) {
        _burn(_msgSender(), amount);
        nftClaims[_msgSender()] = amount;
        emit Burn(_msgSender(), amount);
        return true;
    }

    function claimNFT(uint256 amount) external onlyNFT returns (bool) {
        //external erc721 contract calls to claim
        require(nftClaims[msgSender] > 0);
        nftClaims[_msgSender()] -= amount;
        emit Claim(_msgSender(), amount);
        return true;
    }
}
