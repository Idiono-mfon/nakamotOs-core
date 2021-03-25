// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC721.sol";

contract NakamotOsNFT is ERC721 {
    event Mint(address indexed minter, uint256 tokenId);
    address public nakamotoserc20;


    string public constant name = "NakamotOs";
    string public constant symbol = "NKMTO";

    struct Cereal {
        address mintedBy;
        uint64 mintedAt;
    }
    
    Cereal[] boxes;

    mapping(address => uint256) public tokenIdToOwner;
    mapping(address => uint256) public tokenHolderAmt;
    mapping(uint256 => address) public tokenIdToApproved;

    constructor(address nakamotosErc20Addr) public ERC721("NakamotOs", "NKMTO") {
        nakatoserc20 = nakamotosErc20Addr;
    }


    function _mint(address _owner, uint256 amount) external {
        nakamotoserc20.claimNFT(amount, _owner);

        for(i = 1; i <= amount; i +=1) {
            Cereal memory cereal = Cereal({
                mintedBy: _owner,
                mintedAt: uint64(now)
            });
            
            Mint(_owner, tokenId);

            tokenId = boxes.push(cereal);
            //ids are 1 indexed
        }

    }
    
}