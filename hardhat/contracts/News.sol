// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// Custom error messages
error News__AlreadyUserHaveCredentials();
error News__TokenIdDoesNotExists();
error News__UserCannotBurnCredentials();
error News__UserCannotTransferCredentials();

// TestWallet Contract
contract News is ERC721Enumerable, ERC721URIStorage, AccessControl, Pausable {
    // Bytes32 for Access Control Roles
    bytes32 public constant NEWS_ORGANISATION_ROLE =
        keccak256("NEWS_ORGANISATION_ROLE");
    bytes32 public constant NEWS_JOURNALIST_ROLE =
        keccak256("NEWS_JOURNALIST_ROLE");

    mapping(uint256 => bytes[]) private s_newsData;

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

    /**************************
        MAIN FUNCTIONs
    ***************************/

    /**
     * @dev Send new credentials to a user with the specified URI.
     * @param _to Address of the recipient.
     * @param _credsURI URI of the credentials.
     */
    function sendCredentials(
        address _to,
        string calldata userName,
        string calldata _credsURI
    ) public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        if (checkAddressHaveCredentials(_to))
            revert News__AlreadyUserHaveCredentials();
        uint256 tokenId = generateTokenId(_to, userName);
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _credsURI);
    }

    /**
     * @dev Burn a tokenId belonging to the specified tokenId.
     * @param tokenId ID of the user to burn.
     */
    function burnCredentials(uint256 tokenId)
        public
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (ownerOf(tokenId) == address(0)) revert News__TokenIdDoesNotExists();

        _burn(tokenId);
    }

    /**
     * @dev Store news content for a user.
     * @param newsCid Content ID (CID) of the news to be stored.
     */
    function storeNews(string calldata newsCid)
        public
        whenNotPaused
        onlyRole(NEWS_ORGANISATION_ROLE)
        onlyRole(NEWS_JOURNALIST_ROLE)
    {
        // Get the tokenId of the caller (user)
        uint256 tokenId = getTokenIdOfAnUser(_msgSender());

        // Convert newsCid string to bytes
        bytes memory cidInBytes = stringToBytes(newsCid);

        // Push the news content bytes to the s_newsData mapping for the specified tokenId
        s_newsData[tokenId].push(cidInBytes);
    }

    /**************************
        HELPER VIEW FUNCTIONS
    ***************************/

    /**
     * @dev Generate a unique tokenId for the given user address.
     * @param userAddress Address of the user for whom tokenId is generated.
     * @param userName Name of the user to include in the tokenId.
     * @return uint256 The generated tokenId.
     */
    function generateTokenId(address userAddress, string memory userName)
        public
        view
        returns (uint256)
    {
        // Convert userAddress to hex string
        string memory addressToString = Strings.toHexString(
            uint256(uint160(userAddress)),
            20
        );

        // Convert totalSupply, block.timestamp, and userName to string
        string memory totalSupplyToString = Strings.toString(totalSupply());
        string memory timestampToString = Strings.toString(block.timestamp);

        // Concatenate all components to create a unique string
        string memory concatenatedString = string(
            abi.encodePacked(
                addressToString,
                userName,
                totalSupplyToString,
                timestampToString
            )
        );

        // Convert the concatenated string to uint256 using keccak256 hash
        return stringToUint256(concatenatedString);
    }

    /**
     * @dev Fetch news data associated with a specific tokenId.
     * @param tokenId The unique identifier for a user's credentials.
     * @return An array of news data (content identifiers) associated with the given tokenId.
     */
    function fetchNewsForTokenId(uint256 tokenId)
        public
        view
        returns (string[] memory)
    {
        // Retrieve news data in bytes associated with the given tokenId
        bytes[] memory allCidInBytesArray = s_newsData[tokenId];
        string[] memory allCidInStringArray = new string[](
            allCidInBytesArray.length
        );

        // Convert bytes to string for each content identifier
        for (uint256 i = 0; i < allCidInBytesArray.length; ++i) {
            allCidInStringArray[i] = bytesToString(allCidInBytesArray[i]);
        }

        // Return the array of content identifiers
        return allCidInStringArray;
    }

    /**
     * @dev Get the latest content identifier associated with a specific tokenId.
     * @param tokenId The unique identifier for a user's credentials.
     * @return The latest content identifier in string format.
     */
    function getLatestCid(uint256 tokenId) public view returns (string memory) {
        // Retrieve news data in bytes associated with the given tokenId
        bytes[] memory allCidInBytesArray = s_newsData[tokenId];
        uint256 cidArrayLength = allCidInBytesArray.length;

        // Get the latest content identifier in bytes
        bytes memory cidInBytes = allCidInBytesArray[cidArrayLength - 1];

        // Convert bytes to string for the latest content identifier
        return bytesToString(cidInBytes);
    }

    /**
     * @dev Get the tokenId associated with a specific user address.
     * @param userAddress The address of the user.
     * @return The tokenId associated with the user.
     */
    function getTokenIdOfAnUser(address userAddress)
        public
        view
        returns (uint256)
    {
        // Get the tokenId associated with the user's address
        return tokenOfOwnerByIndex(userAddress, 0);
    }

    /**
     * @dev Get the news data (content identifiers) associated with a specific tokenId.
     * @param tokenId The unique identifier for a user's credentials.
     * @return An array of news data in bytes associated with the given tokenId.
     */
    function getNewsData(uint256 tokenId) public view returns (bytes[] memory) {
        // Retrieve news data in bytes associated with the given tokenId
        return s_newsData[tokenId];
    }

    /**
     * @dev Check if a user owns any credentials.
     * @param _userAddress Address of the user.
     */
    function checkAddressHaveCredentials(address _userAddress)
        public
        view
        returns (bool)
    {
        return balanceOf(_userAddress) > 0;
    }

    /**************************
        HELPER PURE FUNCTIONS
    ***************************/

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
        // Convert the string to bytes
        bytes memory theBytes = bytes(theString);

        // Calculate the keccak256 hash of the bytes
        bytes32 theHash = keccak256(theBytes);

        // Convert the hash to uint256
        uint256 theUint256 = uint256(theHash);

        // Return the resulting uint256 value
        return theUint256;
    }

    /**
     * @dev Convert a string to bytes.
     * @param theString String to convert.
     * @return bytes Converted bytes value.
     */
    function stringToBytes(string calldata theString)
        public
        pure
        returns (bytes memory)
    {
        // Convert the string to bytes
        bytes calldata theBytes = bytes(theString);

        // Return the resulting bytes value
        return theBytes;
    }

    /**
     * @dev Convert bytes to string.
     * @param theBytes Bytes to convert.
     * @return string Converted string value.
     */
    function bytesToString(bytes memory theBytes)
        public
        pure
        returns (string memory)
    {
        // Convert bytes to string
        string memory theString = string(abi.encodePacked(theBytes));

        // Return the resulting string value
        return theString;
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
