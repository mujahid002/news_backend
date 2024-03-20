require("dotenv").config();
const { ObjectId } = require("mongodb");
const ethers = require("ethers");
const { testNewsContract } = require("../constants/index.js");
const uploadFile = require("../services/pinata.js");

const {
  fetchOrganizationDetailsFromId,
} = require("../database/functions/orgFunctions.js");

const createFileAndUploadForOrg = async (data) => {
  try {
    const fileName = `${data.org_username}.json`;

    const selectedData = {
      name: data.org_legal_name,
      description: `Name of the Organisatoin: ${data.org_name} with unique name of ${data.org_username}`,
      image:
        data.image ||
        "https://ipfs.io/ipfs/QmYGAKBR1R34g8kXgDaQSjuji1WwYokNM9jEkMG67jjD1w",
      image_url:
        data.image ||
        "https://ipfs.io/ipfs/QmYGAKBR1R34g8kXgDaQSjuji1WwYokNM9jEkMG67jjD1w",
      external_url: `${data.org_website[0]}`,
      attributes: [
        {
          trait_type: `Name`,
          value: data.org_name,
        },
        {
          trait_type: `Legal Type`,
          value: data.org_legal_type,
        },
        {
          trait_type: `Category`,
          value: data.org_category,
        },
        {
          trait_type: `Type`,
          value: data.org_type,
        },
        {
          display_type: "date",
          trait_type: "Organisation Joined Date",
          value: Math.floor(Date.now() / 1000),
          // value: Math.floor(new Date(data.issueDate).getTime() / 1000),
        },
      ],
    };

    const cid = await uploadFile(fileName, JSON.stringify(selectedData));

    if (!cid) {
      throw new Error("Failed to upload file to IPFS.");
    }

    return cid;
  } catch (error) {
    console.error("Error creating and uploading file:", error);
    throw error;
  }
};
const createFileAndUploadForJournalist = async (data) => {
  try {
    const fileName = `${data.journalist_username}.json`;

    const selectedData = {
      name: `${data.journalist_first_name} ${data.journalist_last_name}`,
      description: `Journalist ${data.journalist_first_name} ${data.journalist_last_name} from organization ID ${data.org_id}. About: ${data.about_journalist}`,
      image:
        data.image ||
        "https://ipfs.io/ipfs/QmSyKYTMCZmkU6Vp3E62rSDn3UDqM5f25uoQCYN5AfXRtX",
      image_url:
        data.image ||
        "https://ipfs.io/ipfs/QmSyKYTMCZmkU6Vp3E62rSDn3UDqM5f25uoQCYN5AfXRtX",
      external_url: data.journalist_website || "",
      attributes: [
        {
          trait_type: "Name",
          value: data.journalist_first_name + data.journalist_last_name,
        },
        {
          trait_type: "Category",
          value: data.category,
        },
        {
          trait_type: "Email",
          value: data.journalist_email,
        },
        {
          trait_type: "Contact",
          value: data.journalist_contact,
        },
        {
          trait_type: "Username",
          value: data.journalist_username,
        },
        {
          display_type: "date",
          trait_type: "Journalist Joined Date",
          value: Math.floor(Date.now() / 1000),
          // value: Math.floor(new Date(data.issueDate).getTime() / 1000),
        },
      ],
    };

    const cid = await uploadFile(fileName, JSON.stringify(selectedData));

    if (!cid) {
      throw new Error("Failed to upload file to IPFS.");
    }

    return cid;
  } catch (error) {
    console.error("Error creating and uploading file for journalist:", error);
    throw error;
  }
};
const createFactCheckAndUploadFile = async (data, orgData) => {
  try {
    const fileName = `${data.fact_checker_org_id}-${orgData.org_type}-${data.comment_journalist}.json`;
    const selectedData = {
      fact_check_news: data.fact_check_news,
      fact_check_time: data.fact_check_time,
      fact_check_priority: data.fact_check_priority,
      comment: data.comment,
      comment_timestamp: Math.floor(Date.now() / 1000),
      comment_journalist: data.comment_journalist,
      fact_check_documents: data.fact_check_documents,
      fact_check_links: data.fact_check_links,
      fact_check_videos: data.fact_check_videos,
      fact_checker_org_name: orgData.org_name,
      fact_checker_org_legal_name: orgData.org_legal_name,
      fact_checker_org_category: orgData.org_category,
      fact_checker_org_website: orgData.org_website,
      fact_checker_org_contact_emails: orgData.org_contact_emails,
      fact_checker_org_type: orgData.org_type,
      fact_checker_org_wallet_address: orgData.org_wallet_address,
      fact_checker_token_id: orgData.org_token_id,
    };

    const cid = await uploadFile(fileName, JSON.stringify(selectedData));

    if (!cid) {
      throw new Error("Failed to upload file to IPFS.");
    }

    return cid;
  } catch (error) {
    console.error("Error creating and uploading file for journalist:", error);
    throw error;
  }
};

const issueCertificateTxnForOrg = async (data) => {
  try {
    if (!data) {
      return {
        success: false,
        error: "Invalid parameters. data is required.",
      };
    }

    // Upload data to pinata
    const cid = await createFileAndUploadForOrg(data);

    if (!cid) {
      throw new Error("Failed to obtain CID for the data file.");
    }

    const uri = `https://ipfs.io/ipfs/${cid}`;

    console.log("The URI is ", uri);

    let isFactChecker = false;

    if (data.org_type == "fact checker") {
      isFactChecker = true;
    }

    const gasAmount = await testNewsContract.estimateGas.issueCertificate(
      // data.org_wallet_address ||
      "0x709d29dc073F42feF70B6aa751A8D186425b2750",
      data.org_username,
      uri
    );

    const defaultGasLimit = 5000000;
    console.log("the estimated gas is: ", gasAmount.toNumber());

    const gasLimit = gasAmount.toNumber() || defaultGasLimit;

    const tx = await testNewsContract.issueCertificate(
      // data.org_wallet_address ||
      "0x709d29dc073F42feF70B6aa751A8D186425b2750",
      data.org_username,
      uri,
      {
        gasLimit: gasLimit,
      }
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Find the emitted event in the logs
    const transferEvent = receipt.events.find(
      (event) => event.event === "transfer"
    );

    if (transferEvent) {
      const tokenId = transferEvent.args.tokenId.toString();

      console.log(
        `Token ID: ${tokenId} minted to ${
          // data.org_wallet_address ||
          "0x709d29dc073F42feF70B6aa751A8D186425b2750"
        } with transaction hash ${tx.hash}`
      );

      return {
        success: true,
        orgTokenId: tokenId,
        jsonData: uri,
        txnHash: tx.hash,
      };
    } else {
      console.log("Event not found in transaction logs");
      return {
        success: false,
        error: "Event not found in transaction logs",
      };
    }
  } catch (error) {
    console.error("Error in issueCertificateTxn: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
const issueCertificateTxnForJournalist = async (data) => {
  try {
    if (!data) {
      return {
        success: false,
        error: "Invalid parameters. data is required.",
      };
    }

    // Upload data to pinata
    const cid = await createFileAndUploadForJournalist(data);

    if (!cid) {
      throw new Error("Failed to obtain CID for the data file.");
    }

    const uri = `https://ipfs.io/ipfs/${cid}`;

    console.log("The URI is ", uri);

    const gasAmount = await testNewsContract.estimateGas.issueCertificate(
      // data.journalist_wallet_address ||
      "0x709d29dc073F42feF70B6aa751A8D186425b2750",
      data.journalist_username,
      uri
    );

    const defaultGasLimit = 5000000;
    console.log("the estimated gas is: ", gasAmount.toNumber());

    const gasLimit = gasAmount.toNumber() || defaultGasLimit;

    const tx = await testNewsContract.issueCertificate(
      // data.journalist_wallet_address ||
      "0x709d29dc073F42feF70B6aa751A8D186425b2750",
      data.journalist_username,
      uri,
      {
        gasLimit: gasLimit,
      }
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Find the emitted event in the logs
    const transferEvent = receipt.events.find(
      (event) => event.event === "transfer"
    );

    if (transferEvent) {
      const tokenId = transferEvent.args.tokenId.toString();

      console.log(
        `Token ID: ${tokenId} minted to ${
          // data.journalist_wallet_address ||
          "0x709d29dc073F42feF70B6aa751A8D186425b2750"
        } with transaction hash ${tx.hash}`
      );

      return {
        success: true,
        journalistTokenId: tokenId,
        jsonData: uri,
        txnHash: tx.hash,
      };
    } else {
      console.log("Event not found in transaction logs");
      return {
        success: false,
        error: "Event not found in transaction logs",
      };
    }
  } catch (error) {
    console.error("Error in issueCertificateTxnForJournalist: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
const notorizeTxn = async (data) => {
  try {
    if (!data) {
      return {
        success: false,
        error: "Invalid parameters. Wallet and data are required.",
      };
    }

    // Upload data to pinata
    const cid = await uploadFile(data.news_authors[0], JSON.stringify(data));
    // await cid.toString();

    if (!cid) {
      throw new Error("Failed to obtain CID for the data file.");
    }

    const uri = `https://ipfs.io/ipfs/${cid}`;

    console.log("The URI is ", uri);

    // const gasAmount = await testNewsContract.estimateGas.notorize(cid);

    const defaultGasLimit = 30000000;
    // console.log("the estimated gas is: ", gasAmount.toNumber());

    // const gasLimit = gasAmount.toNumber() || defaultGasLimit;

    const tx = await testNewsContract.notorize(cid, {
      gasLimit: 30000000,
      // gasLimit: gasLimit,
    });

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Find the emitted event in the logs
    // const newsCidEventEvent = receipt.events.find(
    //   (event) => event.event === "newsCidEvent"
    // );

    if (receipt) {
      // const cidInBytes = newsCidEventEvent.args.data;

      console.log(
        `Uploaded CID to Blockchain: CID: ${cid} with transaction hash ${tx.hash}`
      );

      return {
        success: true,
        newsId: cid,
        jsonData: uri,
        txnHash: tx.hash,
      };
    } else {
      console.log("Event not found in transaction logs");
      return {
        success: false,
        error: "Event not found in transaction logs",
      };
    }
  } catch (error) {
    console.error("Error in notorizeTxn: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
const factCheckTxn = async (data) => {
  try {
    if (!data) {
      return {
        success: false,
        error: "Invalid parameters. Wallet and data are required.",
      };
    }

    const _id = data.fact_checker_org_id;
    console.log("the id is", _id);

    if (_id && typeof _id === "string" && ObjectId.isValid(_id)) {
      const objectId = new ObjectId(_id);
      console.log("the objectId is", objectId);

      const orgData = await fetchOrganizationDetailsFromId(objectId);
      // Upload data to pinata
      // const cid = await uploadFile(data.news_authors[0], JSON.stringify(data));
      const cid = await createFactCheckAndUploadFile(data, orgData);

      // await cid.toString();

      if (!cid) {
        throw new Error("Failed to obtain CID for the data file.");
      }

      const uri = `https://ipfs.io/ipfs/${cid}`;

      console.log("The URI is ", uri);

      const orgTokenIdUint256 = ethers.BigNumber.from(orgData.org_token_id);

      // const gasAmount = await testNewsContract.estimateGas.factNotorize(
      //   orgTokenIdUint256,
      //   data.fact_check_news,
      //   cid
      // );

      const defaultGasLimit = 30000000;
      // console.log("the estimated gas is: ", gasAmount.toNumber());

      // const gasLimit = gasAmount.toNumber() || defaultGasLimit;

      const tx = await testNewsContract.factNotorize(
        orgTokenIdUint256,
        data.fact_check_news,
        cid,
        {
          gasLimit: defaultGasLimit,
          // gasLimit: gasLimit,
        }
      );

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Find the emitted event in the logs
      // const newsCidEventEvent = receipt.events.find(
      //   (event) => event.event === "newsCidEvent"
      // );

      if (receipt) {
        console.log(
          `Uploaded CID to Blockchain: CID: ${cid} for news cid of  ${data.fact_check_news} with transaction hash ${tx.hash}`
        );

        return {
          success: true,
          factCheckCid: cid,
          jsonData: uri,
          txnHash: tx.hash,
        };
      } else {
        console.log("Event not found in transaction logs");
        return {
          success: false,
          error: "Event not found in transaction logs",
        };
      }
    } else {
      console.error("Unable to get Org Data from given _id");
    }
  } catch (error) {
    console.error("Error in factCheckTxn: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
// const updateNewsTxn = async (data) => {
//   try {
//     if (!data) {
//       return {
//         success: false,
//         error: "Invalid parameters. Wallet and data are required.",
//       };
//     }

//     // Upload data to pinata
//     const cid = await uploadFile(data.news_authors[0], JSON.stringify(data));
//     // await cid.toString();

//     if (!cid) {
//       throw new Error("Failed to obtain CID for the data file.");
//     }

//     const uri = `https://ipfs.io/ipfs/${cid}`;

//     console.log("The URI is ", uri);

//     const gasAmount = await testNewsContract.estimateGas.notorize(cid);

//     const defaultGasLimit = 5000000;
//     console.log("the estimated gas is: ", gasAmount.toNumber());

//     const gasLimit = gasAmount.toNumber() || defaultGasLimit;

//     const tx = await testNewsContract.notorize(cid, {
//       gasLimit: gasLimit,
//     });

//     // Wait for the transaction to be mined
//     const receipt = await tx.wait();

//     // Find the emitted event in the logs
//     const newsCidEventEvent = receipt.events.find(
//       (event) => event.event === "newsCidEvent"
//     );

//     if (newsCidEventEvent) {
//       const cidInBytes = newsCidEventEvent.args.data;

//       console.log(
//         `Uploaded CID to Blockchain: CID: ${cid} & Data in Bytes: ${cidInBytes} with transaction hash ${tx.hash}`
//       );

//       return {
//         success: true,
//         newsId: cid,
//         newdIdInBytes: cidInBytes,
//         jsonData: uri,
//         txnHash: tx.hash,
//       };
//     } else {
//       console.log("Event not found in transaction logs");
//       return {
//         success: false,
//         error: "Event not found in transaction logs",
//       };
//     }
//   } catch (error) {
//     console.error("Error in updateNewsTxn: ", error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };

// const generateUniqueOrgIdTxn = async (walletAddress, userName) => {
//   try {
//     if (!walletAddress || !userName) {
//       return {
//         success: false,
//         error: "Invalid parameters. Wallet and userName are required.",
//       };
//     }

//     const gasAmount = await testNewsContract.estimateGas.generateTokenId(
//       walletAddress,
//       userName
//     );

//     // call function
//     const defaultGasLimit = 500000;

//     const uniqueOrgIdInBigNumber = await testNewsContract.generateTokenId(
//       walletAddress,
//       userName,
//       {
//         gasLimit: gasAmount.toNumber() || defaultGasLimit,
//       }
//     );

//     await uniqueOrgIdInBigNumber;

//     const uniqueOrgId = ethers.BigNumber.from(
//       uniqueOrgIdInBigNumber
//     ).toString();

//     console.log(
//       `Unique org ID: ${uniqueOrgId} generated to ${walletAddress} & ${userName}`
//     );

//     return {
//       success: true,
//       orgId: uniqueOrgId,
//     };
//   } catch (error) {
//     console.error("Error in generateUniqueOrgIdTxn: ", error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };
// const generateUniqueJournalistIdTxn = async (walletAddress, userName) => {
//   try {
//     if (!walletAddress || !userName) {
//       return {
//         success: false,
//         error: "Invalid parameters. Wallet and userName are required.",
//       };
//     }

//     const gasAmount = await testNewsContract.estimateGas.generateTokenId(
//       walletAddress,
//       userName
//     );

//     // call function
//     const defaultGasLimit = 500000;

//     const uniqueJournalistIdInBigNumber =
//       await testNewsContract.generateTokenId(walletAddress, userName, {
//         gasLimit: gasAmount.toNumber() || defaultGasLimit,
//       });

//     await uniqueJournalistIdInBigNumber;

//     const uniqueJournalistId = ethers.BigNumber.from(
//       uniqueJournalistIdInBigNumber
//     ).toString();

//     console.log(
//       `Unique journalist ID: ${uniqueJournalistId} generated to ${walletAddress} & ${userName}`
//     );

//     return {
//       success: true,
//       journalistId: uniqueJournalistId,
//     };
//   } catch (error) {
//     console.error("Error in generateUniqueJournalistIdTxn: ", error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// };
// // generateUniqueOrgIdTxn("0x709d29dc073F42feF70B6aa751A8D186425b2750", "Mujahid");

module.exports = {
  // generateUniqueOrgIdTxn,
  // generateUniqueJournalistIdTxn,
  createFileAndUploadForOrg,
  issueCertificateTxnForOrg,
  issueCertificateTxnForJournalist,
  notorizeTxn,
  factCheckTxn,
  // updateNewsTxn,
};
