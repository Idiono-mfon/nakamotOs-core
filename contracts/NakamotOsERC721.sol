// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./NakamotOsERC20.sol";

contract NakamotOsERC721 is ERC721Enumerable, Ownable {
    NakamotOsERC20 public nakamotOsErc20;

    string public _tokenURI;

    constructor(
        string memory name,
        string memory symbol,
        string memory tokenURI_
    ) ERC721(name, symbol) {
        _tokenURI = tokenURI_;
    }

    function setERC20Address(address erc20Address) external onlyOwner {
        nakamotOsErc20 = NakamotOsERC20(erc20Address);
    }

    function tokenURI(uint256 /* tokenId */) public view override returns (string memory) {
        return _tokenURI;
    }

    function mint(uint amount) external {
        require(nakamotOsErc20.claimNFT(amount, _msgSender()), "Unable to claim token.");

        for (uint i = 0; i < amount; i++) {
            _safeMint(_msgSender(), totalSupply());
        }
    }
}
