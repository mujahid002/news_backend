// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// Custom error messages
error News__AlreadyUserHaveCertificate();
error News__TokenIdDoesNotExists();
error News__UserCannotBurnCertificate();
error News__UserCannotTransferCertificate();

// TestWallet Contract
contract TestNews is ERC721Enumerable, ERC721URIStorage, ERC721Burnable, AccessControl, Pausable {
    // Bytes32 for Access Control Roles
    bytes32 public constant NEWS_PUBLISHER_ROLE =
        keccak256("NEWS_PUBLISHER_ROLE");

    // Mapping: tokenId is mapped with Array of Bytes, array elements indicates CID in bytes format
    mapping(uint256 => bytes[]) private s_newsData;

    // events
    event storedLatestNews(
        uint256 indexed tokenId,
        string indexed cid,
        bytes indexed data
    );
    // Event for token transfers
    event transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId,
        bytes data
    );

    // Constructor
    constructor() ERC721("TestNewsToken", "TNT") {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(NEWS_PUBLISHER_ROLE, _msgSender());
    }

    /**************************
        TESTING PURPOSES
    ***************************/
    function fetchUserTokenIds(address _userAddress)
        public
        view
        returns (uint256[] memory)
    {
        uint256 userTokenIdCount = balanceOf(_userAddress);
        uint256[] memory _allUserTokenIds = new uint256[](userTokenIdCount);
        for (uint256 i = 0; i < userTokenIdCount; i++) {
            _allUserTokenIds[i] = tokenOfOwnerByIndex(_userAddress, i);
        }

        return _allUserTokenIds;
    }
    function fetchLatestTokenIdOfAnUser(address _userAddress)
        public
        view
        returns (uint256)
    {
        uint256 userTokenIdCount = balanceOf(_userAddress);
        return tokenOfOwnerByIndex(_userAddress, userTokenIdCount-1);
        
    }
    /**************************
        MAIN FUNCTIONS
    ***************************/

    /**
     * @dev Send new Certificate to a user with the specified URI.
     * @param _to: Address of the publisher.
     * @param _credsURI: URI indicates Certificate for Publisher.
     */
    function sendCertificate(
        address _to,
        string calldata userName,
        string calldata _credsURI
    ) public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        // for testing purposes removed check...
        // if (checkAddressHaveCertificate(_to))
        //     revert News__AlreadyUserHaveCertificate();
        uint256 tokenId = generateTokenId(_to, userName);
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _credsURI);
        _grantRole(NEWS_PUBLISHER_ROLE, _to);
        emit transfer(_msgSender(),_to,tokenId,"");
    }

    /**
     * @dev Burn a tokenId belonging to the specified tokenId.
     * @param tokenId: ID of the publisher to burn.
     */
    function burnCertificate(uint256 tokenId)
        public
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (ownerOf(tokenId) == address(0)) revert News__TokenIdDoesNotExists();

        _burn(tokenId);
        _revokeRole(NEWS_PUBLISHER_ROLE, ownerOf(tokenId));
    }

    /**
     * @dev Store news content as a CID by Publisher.
     * @param newsCid: CID of the news from IPFS to be stored on contract.
     */
    function submitNews(string calldata newsCid)
        public
        whenNotPaused
        onlyRole(NEWS_PUBLISHER_ROLE)
    {
        uint256 tokenId = getTokenIdOfAnUser(_msgSender());

        // Convert newsCid string to bytes
        bytes memory cidInBytes = bytes(newsCid);

        s_newsData[tokenId].push(cidInBytes);
        emit storedLatestNews(tokenId, newsCid, cidInBytes);
    }

    /**************************
        HELPER VIEW FUNCTIONS
    ***************************/

    /**
     * @dev Generate a unique tokenId for the given user address.
     * @param userAddress: Address of the publisher for whom tokenId is generated.
     * @param userName: username of the Org/Journalist to include in the unique tokenId.
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
        // string memory totalSupplyToString = Strings.toString(totalSupply());
        string memory timestampToString = Strings.toString(block.timestamp);

        // Concatenate all components to create a unique string
        string memory concatenatedString = string(
            abi.encodePacked(
                addressToString,
                userName,
                // totalSupplyToString,
                timestampToString
            )
        );

        // Convert the concatenated string to uint256
        return stringToUint256(concatenatedString);
    }

    /**
     * @dev Fetch news data associated with a specific tokenId.
     * @param tokenId: The unique identifier of publisher.
     */
    function fetchNewsForTokenIdInStringArray(uint256 tokenId)
        public
        view
        returns (string[] memory)
    {
        // Retrieve news data in bytes array associated with the given tokenId
        bytes[] memory allCidInBytesArray = s_newsData[tokenId];
        string[] memory allCidInStringArray = new string[](
            allCidInBytesArray.length
        );

        // Convert bytes to string from each element to CID(string)
        for (uint256 i = 0; i < allCidInBytesArray.length; ++i) {
            allCidInStringArray[i] = string(
                abi.encodePacked(allCidInBytesArray[i])
            );
        }
        return allCidInStringArray;
    }

    /**
     * @dev Get the latest CID associated with a specific tokenId.
     * @param tokenId: The unique identifier of publisher.
     */
    function getLatestCid(uint256 tokenId) public view returns (string memory) {
        bytes[] memory allCidInBytesArray = s_newsData[tokenId];
        uint256 cidArrayLength = allCidInBytesArray.length;

        // Get the latest content identifier in bytes
        bytes memory cidInBytes = allCidInBytesArray[cidArrayLength - 1];

        // Convert bytes to string for the latest content identifier
        return string(abi.encodePacked((cidInBytes)));
    }

    /**
     * @dev Get the tokenId associated with a specific user address.
     * @param userAddress: The address of the publisher.
     */
    function getTokenIdOfAnUser(address userAddress)
        public
        view
        returns (uint256)
    {
        return tokenOfOwnerByIndex(userAddress, 0);
    }

    /**
     * @dev Get the news data (content identifiers) associated with a specific tokenId.
     * @param tokenId: The unique identifier of publisher.
     */
    function getNewsDataInBytesArray(uint256 tokenId) public view returns (bytes[] memory) {
        // Retrieve news data in bytes associated with the given tokenId
        return s_newsData[tokenId];
    }

    /**
     * @dev Check if a user owns any Certificate.
     * @param _userAddress: Address of the user.
     */
    function checkAddressHaveCertificate(address _userAddress)
        public
        view
        returns (bool)
    {
        // for testing...
        return balanceOf(_userAddress) > 0;

        // return balanceOf(_userAddress)==1;
    }

    /**************************
        HELPER PURE FUNCTIONS
    ***************************/

    /**
     * @dev Convert a string to uint256 using keccak256 hash.
     * @param theString: String to convert.
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

        return theUint256;
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
        revert News__UserCannotTransferCertificate();
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override(ERC721, IERC721) {
        emit transfer(from, to, tokenId, data);
        revert News__UserCannotTransferCertificate();
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721, IERC721) {
        emit transfer(from, to, tokenId, "");
        revert News__UserCannotTransferCertificate();
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage,AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
