// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NakamotOsERC20.sol";

contract NakamotOsERC721 is ERC721, Ownable {
    NakamotOsERC20 public nakamotOsErc20;

    string public _tokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory tokenURI_
    ) public ERC721(name, symbol) {
        _tokenURI = tokenURI_;
    }

    modifier onlyNakamotOs() {
        require(_msgSender() == address(nakamotOsErc20), "Caller must the NakamotOsERC20");
        _;
    }

    function setERC20Address(address erc20Address) external onlyOwner {
        nakamotOsErc20 = NakamotOsERC20(erc20Address);
    }

    function tokenURI(uint256 /* tokenId */) public view override returns (string memory) {
        return _tokenURI;
    }

    function mintOne(address recipient) external onlyNakamotOs returns (bool) {
        _safeMint(recipient, totalSupply());
    }
}
