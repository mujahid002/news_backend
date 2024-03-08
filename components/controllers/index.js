const { ObjectId } = require("mongodb");
const {
  storeOrganisationRegisterDetails,
  storeJournalistRegisterDetails,
  storeNewsDetails,
} = require("../../database/functions/index");
const {
  fetchOrganizationDetailsFromId,
  fetchJournalistDetailsFromId,
  fetchNewsDetailsFromId,
} = require("../../database/functions/admin");
const {
  generateUniqueOrgIdTxn,
  generateUniqueJournalistIdTxn,
  sendCertificateTxnForOrg,
  sendCertificateTxnForJournalist,
  submitNewsTxn,
} = require("../../services/web3");

const loginController = async (req, res) => {
  res.send("Login controller function running");
};

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
const submitNewsController = async (req, res) => {
  try {
    const { _id } = req.body;

    if (_id && typeof _id === "string" && ObjectId.isValid(_id)) {
      const objectId = new ObjectId(_id);
      const news = await fetchNewsDetailsFromId(objectId);
      const newsDetails = {
        _id: objectId,
      };

      const generateNewsIdResponse = await submitNewsTxn(news);

      if (generateNewsIdResponse.success) {
        const newNewsDetails = {
          ...newsDetails,
          news_published_wallet_address:
            news.news_published_wallet_address ||
            "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          news_pinata_id: generateNewsIdResponse.newsId,
          // news_id_inBytes: generateNewsIdResponse.newdIdInBytes,
          news_pinata_uri: generateNewsIdResponse.jsonData,
          news_transaction_id: generateNewsIdResponse.txnHash,
        };

        await storeNewsDetails(newNewsDetails);

        // Sending a single argument or an array of arguments
        res.status(200).json({
          updatedMongoWithThisLatestData: newNewsDetails,
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
  loginController,
  orgRegisterController,
  journalistRegisterController,
  submitNewsController,
};
