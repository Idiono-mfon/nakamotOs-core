// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract NakamotOs is ERC20 {
    event Burn(address indexed burner, uint256 amount);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply,
        address bagHolder
    ) ERC20(name_, symbol_) {
        _mint(bagHolder, maxSupply);
    }

    function burn(uint256 amount) external returns (bool) {
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount);
        return true;
    }
}
