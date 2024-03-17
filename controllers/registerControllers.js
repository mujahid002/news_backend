const { ObjectId } = require("mongodb");
const {
  storeOrganisationRegisterDetails,
  fetchOrganizationDetailsFromId,
} = require("../database/functions/orgFunctions.js");
const {
  storeJournalistRegisterDetails,
  fetchJournalistDetailsFromId,
} = require("../database/functions/journalistFunctions.js");
const {
  storeNewsDetails,
  storeNewsDetailsOfNewId,
  storeUpdatedNewsDetails,
  fetchNewsDetailsFromId,
} = require("../database/functions/newsFunctions.js");
const {
  sendCertificateTxnForOrg,
  sendCertificateTxnForJournalist,
  submitNewsTxn,
} = require("../services/web3");

const orgRegisterController = async (req, res) => {
  try {
    const { _id } = req.body;

    if (_id && typeof _id === "string" && ObjectId.isValid(_id)) {
      const objectId = new ObjectId(_id);
      const organisationDetails = await fetchOrganizationDetailsFromId(
        objectId
      );

      const orgDetails = {
        _id: objectId,
      };
      const generateOrgIdResponse = await sendCertificateTxnForOrg(
        organisationDetails
      );

      if (generateOrgIdResponse.success) {
        const orgAdditionalDetails = {
          ...orgDetails,
          org_token_id: generateOrgIdResponse.orgTokenId,
          org_transaction_id: generateOrgIdResponse.txnHash,
          org_pinata_uri: generateOrgIdResponse.jsonData,
        };

        await storeOrganisationRegisterDetails(orgAdditionalDetails);

        res.status(200).json({
          updatedMongoWithThisLatestData: orgAdditionalDetails,
        });
        return;
      } else {
        res.status(500).send({ code: 500, message: "Internal Server Error" });
        return;
      }
    } else {
      res
        .status(500)
        .send({ code: 500, message: "Internal server error: Invalid _id" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
};

const journalistRegisterController = async (req, res) => {
  try {
    const { _id } = req.body;

    if (_id && typeof _id === "string" && ObjectId.isValid(_id)) {
      const objectId = new ObjectId(_id);
      const journalist = await fetchJournalistDetailsFromId(objectId);
      // Add any future data
      const journalistDetails = { _id: objectId };

      // const wallet = await fetchWalletDetails();
      // console.log(wallet.address);

      const generateJournalistIdResponse =
        await sendCertificateTxnForJournalist(journalist);

      if (generateJournalistIdResponse.success) {
        const newJournalistDetails = {
          ...journalistDetails,
          journalist_token_id: generateJournalistIdResponse.journalistTokenId,
          journalist_transaction_id: generateJournalistIdResponse.txnHash,
          journalist_pinata_uri: generateJournalistIdResponse.jsonData,
        };

        await storeJournalistRegisterDetails(newJournalistDetails);

        // Sending a single argument or an array of arguments
        res.status(200).json({
          updatedMongoWithThisLatestData: newJournalistDetails,
        });
        return;
      } else {
        res.status(500).send({ code: 500, message: "Internal Server Error" });
        return;
      }
    } else {
      res
        .status(500)
        .send({ code: 500, message: "Internal server error: Invalid _id" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
};

const factCheckController = async (req, res) => {
  try {
    const { old_id, new_id } = req.body;

    if (
      old_id &&
      typeof old_id === "string" &&
      ObjectId.isValid(old_id) &&
      new_id &&
      typeof new_id === "string" &&
      ObjectId.isValid(new_id)
    ) {
      const oldObjectId = new ObjectId(old_id);
      const newObjectId = new ObjectId(new_id);
      // const oldNews = await fetchNewsDetailsFromId(oldObjectId);
      const news = await fetchNewsDetailsFromId(newObjectId);
      const newsDetails = {
        _id: oldObjectId,
        new_mongo_id: newObjectId,
      };

      const generateNewsIdResponse = await submitNewsTxn(news);

      if (generateNewsIdResponse.success) {
        const newNewsDetails = {
          ...newsDetails,
          news_published_latest_wallet_address:
            news.news_published_latest_wallet_address ||
            "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          news_latest_pinata_id: generateNewsIdResponse.newsId,
          // news_id_inBytes: generateNewsIdResponse.newdIdInBytes,
          news_latest_pinata_uri: generateNewsIdResponse.jsonData,
          news_latest_transaction_id: generateNewsIdResponse.txnHash,
        };

        await storeNewsDetailsOfNewId(newNewsDetails);
        await storeUpdatedNewsDetails(newNewsDetails);

        // Sending a single argument or an array of arguments
        res.status(200).json({
          updatedMongo_WithThisLatestData_InOldMongoId: newNewsDetails,
        });
        return;
      } else {
        res.status(500).send({ code: 500, message: "Internal Server Error" });
        return;
      }
    } else {
      res
        .status(500)
        .send({ code: 500, message: "Internal server error: Invalid _id" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
};

module.exports = {
  orgRegisterController,
  journalistRegisterController,
  factCheckController,
};
