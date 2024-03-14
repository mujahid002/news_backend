// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import {ERC721, IERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";
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
contract TestNews is
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    AccessControl,
    Pausable
{
    // Bytes32 for Access Control Roles
    bytes32 public constant NEWS_PUBLISHER_ROLE =
        keccak256("NEWS_PUBLISHER_ROLE");
    bytes32 public constant NEWS_FACT_CHECKER_ROLE =
        keccak256("NEWS_FACT_CHECKER_ROLE");

    // Mapping: tokenId is mapped with Array of Strings, array elements indicates CID
    mapping(uint256 => string[]) private s_newsData;

    // Mapping: string is mapped with Array of Strings, array elements indicates fect checked CID for a particular CID
    mapping(string => string[]) private s_factCheckerNews;

    // Mapping: tokenId is mapped with Array of journalist tokenIds
    mapping(uint256 => uint256[]) private s_publishersInOrg;

    // events
    event newsCidEvent(
        uint256 indexed tokenId,
        string indexed cid,
        string indexed factCid
    );
    // Event for token transfers
    event transfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    // Constructor
    constructor() ERC721("TestNewsToken", "TNT") {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(NEWS_PUBLISHER_ROLE, _msgSender());
        _grantRole(NEWS_FACT_CHECKER_ROLE, _msgSender());
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
        return tokenOfOwnerByIndex(_userAddress, userTokenIdCount - 1);
    }

    /**************************
        MAIN FUNCTIONS
    ***************************/

    /**
     * @dev Send new Certificate to a user with the specified URI.
     * @param _to: Address of the publisher.
     * @param _tokenURI: URI indicates Certificate for Publisher.
     */
    function issueCertificate(
        address _to,
        bool IsfactChecker,
        string calldata userName,
        string calldata _tokenURI
    ) public whenNotPaused onlyRole(DEFAULT_ADMIN_ROLE) {
        // for testing purposes removed check...
        // if (checkAddressHaveCertificate(_to))
        //     revert News__AlreadyUserHaveCertificate();
        uint256 tokenId = generateTokenId(_to, userName);
        _safeMint(_to, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        if (IsfactChecker) {
            _grantRole(NEWS_FACT_CHECKER_ROLE, _to);
        } else {
            _grantRole(NEWS_PUBLISHER_ROLE, _to);
        }
        emit transfer(_msgSender(), _to, tokenId);
    }

    /**
     * @dev Burn a tokenId belonging to the specified tokenId.
     * @param tokenId: ID of the user to burn.
     */
    function revokeCertificate(uint256 tokenId, bool IsfactChecker)
        public
        whenNotPaused
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        address userAddress = ownerOf(tokenId);
        if (userAddress == address(0)) revert News__TokenIdDoesNotExists();
        if (IsfactChecker) {
            if (!hasRole(NEWS_FACT_CHECKER_ROLE, userAddress)) revert();
            _burn(tokenId);
            _revokeRole(NEWS_FACT_CHECKER_ROLE, ownerOf(tokenId));
        } else {
            if (!hasRole(NEWS_PUBLISHER_ROLE, userAddress)) revert();
            _burn(tokenId);
            _revokeRole(NEWS_PUBLISHER_ROLE, ownerOf(tokenId));
        }
    }

    /**
     * @dev Store news content as a CID by Publisher.
     * @param newsCid: CID of the news from IPFS to be stored on contract.
     */
    function notorize(string calldata newsCid)
        public
        whenNotPaused
        onlyRole(NEWS_PUBLISHER_ROLE)
    {
        uint256 tokenId = getTokenIdOfAnUser(_msgSender());

        s_newsData[tokenId].push(newsCid);
        emit newsCidEvent(tokenId, newsCid, "");
    }

    /**
     * @dev Store news content as a CID by Publisher.
     * @param newsCid: CID of the news from IPFS to be stored on contract.
     * @param factNewsCid: CID of the fact checker news from IPFS to be stored on contract.
     */

    function factChecker(string calldata newsCid, string calldata factNewsCid)
        public
        whenNotPaused
        onlyRole(NEWS_FACT_CHECKER_ROLE)
    {
        uint256 tokenId = getTokenIdOfAnUser(_msgSender());

        s_factCheckerNews[newsCid].push(factNewsCid);

        emit newsCidEvent(tokenId, newsCid, factNewsCid);
    }

    /**
     * @dev verify the news cid from tokenId and cid .
     * @param tokenId: Token Id of the user.
     * @param newsCid: CID of the news from IPFS to be stored on contract.
     */

    function verifyCid(uint256 tokenId, string calldata newsCid)
        public
        view
        returns (bool)
    {
        string[] memory cidArray = getAllNewsCids(tokenId);
        if (cidArray.length == 0) revert();
        bytes32 newsCidInBytes32 = keccak256(abi.encodePacked(newsCid));
        for (uint256 i = 0; i < cidArray.length; ++i) {
            if (newsCidInBytes32 == keccak256(abi.encodePacked(cidArray[i]))) {
                return true;
            }
        }
        return false;
    }

    function verifyFactCheckerCid(
        string calldata newsCid,
        string calldata factCheckerCid
    ) public view returns (bool) {
        string[] memory cidArray = getAllFactCheckCids(newsCid);
        if (cidArray.length == 0) revert();
        bytes32 factCheckerCidInBytes32 = keccak256(
            abi.encodePacked(factCheckerCid)
        );
        for (uint256 i = 0; i < cidArray.length; ++i) {
            if (
                factCheckerCidInBytes32 ==
                keccak256(abi.encodePacked(cidArray[i]))
            ) {
                return true;
            }
        }
        return false;
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
        return uint256(keccak256(bytes(concatenatedString)));
    }

    function getLatestCid(uint256 tokenId) public view returns (string memory) {
        string[] memory cidArray = getAllNewsCids(tokenId);
        if (cidArray.length == 0) revert();
        return cidArray[cidArray.length - 1];
    }

    function getLatestfactCheckerCid(string calldata newsCid)
        public
        view
        returns (string memory)
    {
        string[] memory cidArray = getAllFactCheckCids(newsCid);
        if (cidArray.length == 0) revert();
        return cidArray[cidArray.length - 1];
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
    function getAllNewsCids(uint256 tokenId)
        public
        view
        returns (string[] memory)
    {
        // Retrieve news data in bytes associated with the given tokenId
        return s_newsData[tokenId];
    }

    function getAllFactCheckCids(string calldata newsCid)
        public
        view
        returns (string[] memory)
    {
        // Retrieve fact check news data associated with the given newsCid
        return s_factCheckerNews[newsCid];
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
        if (_msgSender() != address(0))
            revert News__UserCannotTransferCertificate();
        super._safeTransfer(from, to, tokenId, data);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override(ERC721, IERC721) {
        if (_msgSender() != address(0))
            revert News__UserCannotTransferCertificate();
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override(ERC721, IERC721) {
        if (_msgSender() != address(0))
            revert News__UserCannotTransferCertificate();
        super.transferFrom(from, to, tokenId);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
