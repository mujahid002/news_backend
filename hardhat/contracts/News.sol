// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// Custom error messages
error News__UserCannotBurnCredentials();
error News__UserCannotTransferCredentials();

// TestWallet Contract
contract News is ERC721Enumerable, ERC721URIStorage, AccessControl, Pausable {
    // Bytes32 for Access Control Roles
    bytes32 public constant NEWS_ORGANISATION_ROLE =
        keccak256("NEWS_ORGANISATION_ROLE");
    bytes32 public constant NEWS_JOURNALIST_ROLE =
        keccak256("NEWS_JOURNALIST_ROLE");

    // Event for token transfers
    event transfer(
        address indexed from,
        address indexed to,
        uint256 tokenId,
        bytes data
    );

    // Constructor
    constructor() ERC721("TestNewsToken", "TNT") {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(NEWS_ORGANISATION_ROLE, _msgSender());
        _grantRole(NEWS_JOURNALIST_ROLE, _msgSender());
    }

    /**
     * @dev Send new credentials to a user with the specified URI.
     * @param _to Address of the recipient.
     * @param _credsURI URI of the credentials.
     */
    function sendCredentials(address _to, string calldata _credsURI)
        public
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        uint256 tokenId = generateTokenId(_to);
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _credsURI);
    }

    /**
     * @dev Burn a tokenId belonging to the specified tokenId.
     * @param tokenId ID of the user to burn.
     */
    function burnCredentials(uint256 tokenId)
        external
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            ownerOf(tokenId) != _msgSender(),
            "CredentialRegistry: User cannot burn their own credentials"
        );
        _burn(tokenId);
    }

    /**
     * @dev Generate a unique tokenId for the given user address.
     * @param userAddress Address of the user for whom tokenId is generated.
     * @return uint256 The generated tokenId.
     */
    function generateTokenId(address userAddress)
        public
        view
        returns (uint256)
    {
        string memory addressToString = Strings.toHexString(
            uint256(uint160(userAddress)),
            20
        );
        string memory totalSupplyToString = Strings.toString(totalSupply());
        string memory timestampToString = Strings.toString(block.timestamp);
        string memory concatenatedString = string(
            abi.encodePacked(
                addressToString,
                totalSupplyToString,
                timestampToString
            )
        );
        return stringToUint256(concatenatedString);
    }

    /**
     * @dev Convert a string to uint256 using keccak256 hash.
     * @param theString String to convert.
     * @return uint256 Converted uint256 value.
     */
    function stringToUint256(string memory theString)
        public
        pure
        returns (uint256)
    {
        bytes memory theBytes = bytes(theString);
        bytes32 theHash = keccak256(theBytes);
        uint256 theUint256 = uint256(theHash);
        return theUint256;
    }

    /**
     * @dev Check if a user owns any credentials.
     * @param _userAddress Address of the user.
     * @return True if the user owns notices, false otherwise.
     */
    function checkAddressHaveCredentials(address _userAddress)
        public
        view
        returns (bool)
    {
        return balanceOf(_userAddress) > 0;
    }

    /**************************
    OVERRIDE TRANSFER FUNCTIONS
    ***************************/

    /**
     * @dev Helper Functions: _safeTransfer, safeTransferFrom, transferFrom are overridden functions from ERC721, IERC721 to block user transfer
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual override {
        emit transfer(from, to, tokenId, data);
        revert News__UserCannotTransferCredentials();
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override(ERC721, IERC721) {
        emit transfer(from, to, tokenId, data);
        revert News__UserCannotTransferCredentials();
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721, IERC721) {
        emit transfer(from, to, tokenId, "");
        revert News__UserCannotTransferCredentials();
    }

    /**************************
    OVERRIDE DEFAULT FUNCTIONS
    ***************************/

    /**
     * @dev Default Override Functions to allow contract functionalities
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
