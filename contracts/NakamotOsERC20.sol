// SPDX-License-Identifier: MIT

pragma solidity 0.6.9;

import "./ERC20.sol";
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "./NakamotOsERC721.sol";

contract NakamotOsERC20 is ERC20, VRFConsumerBase {
    using SafeMathChainlink for uint256;

    event Burn(address indexed burner, uint256 amount);
    event LotteryEntered(bytes32 indexed requestId, address indexed participant);
    event LotteryResult(bytes32 indexed requestId, address indexed participant, bool winner);

    NakamotOsERC721 public nftToken;

    bytes32 private s_keyHash;
    uint256 private s_fee;

    mapping(bytes32 => address) private burner;

    /**
     * Technically there can be more than 210
     */
    uint256 public MAX_NFT_SUPPLY = 210;

    uint256 public ONE = 10 ** 18;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply,
        address bagHolder,
        address nftTokenAddress_,
        address vrfCoordinator,
        address link,
        bytes32 keyHash,
        uint256 fee
    )
        public
        ERC20(name_, symbol_)
        VRFConsumerBase(vrfCoordinator, link)
    {
        _mint(bagHolder, maxSupply);
        nftToken = NakamotOsERC721(nftTokenAddress_);
        s_keyHash = keyHash;
        s_fee = fee;
    }

    function burn(uint256 amount, uint256 userProvidedSeed) external returns (bool) {
        _burn(_msgSender(), amount);
        emit Burn(_msgSender(), amount);

        uint256 nftSupply = nftToken.totalSupply();
        if (nftSupply < MAX_NFT_SUPPLY) {
            uint256 i = amount;
            for (i; i > 0; i = i.sub(ONE)) {
                bytes32 requestId = requestRandomness(s_keyHash, s_fee, userProvidedSeed);
                burner[requestId] = _msgSender();
                emit LotteryEntered(requestId, _msgSender());
            }
        }

        return true;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 d100Value = randomness.mod(100);
        if (d100Value < 21) {
            nftToken.mintOne(burner[requestId]);
        }

        emit LotteryResult(requestId, burner[requestId], d100Value < 21);
    }
}
