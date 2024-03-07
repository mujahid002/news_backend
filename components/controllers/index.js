const {
  storeOrganisationRegisterDetails,
  storeJournalistRegisterDetails,
  storeNewsDetails,
} = require("../../database/functions/index");
const { fetchWalletDetails } = require("../../database/functions/admin");
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
    const {
      org_name,
      org_legal_name,
      org_legal_type,
      org_category,
      org_website,
      org_contact_emails,
      org_contact_numbers,
      org_type,
      org_username,
      // org_wallet_address,
      // org_private_key,
    } = req.body;

    const organisation = req.body;

    // console.log(organisation.org_username);
    // res.status(200).json({
    //   organisation: organisation,
    // });
    // return;

    const orgDetails = {
      org_username,
    };

    // const wallet = await fetchWalletDetails();
    // console.log(wallet.address);
    // const generateOrgIdResponse = await generateUniqueOrgIdTxn(
    //   wallet.address,
    //   org_username
    // );
    const generateOrgIdResponse = await sendCertificateTxnForOrg(organisation);

    if (generateOrgIdResponse.success) {
      const orgAdditionalDetails = {
        ...orgDetails,
        org_token_id: generateOrgIdResponse.orgTokenId,
        org_transaction_id: generateOrgIdResponse.txnHash,
        org_pinata_uri: generateOrgIdResponse.jsonData,
      };

      await storeOrganisationRegisterDetails(orgAdditionalDetails);

      // Sending a single argument or an array of arguments
      res.status(200).json({
        data: orgAdditionalDetails,
      });
      return;
    } else {
      res.status(500).send({ code: 500, message: "Internal Server Error" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
};

const journalistRegisterController = async (req, res) => {
  try {
    const {
      journalist_first_name,
      journalist_last_name,
      org_id,
      category,
      about_journalist,
      journalist_email,
      journalist_website,
      journalist_contact,
      journalist_username,
      // journalist_wallet_address,
      // journalist_private_key,
    } = req.body;

    const journalist = req.body;

    // Add any future data
    const journalistDetails = { journalist_username };

    // const wallet = await fetchWalletDetails();
    // console.log(wallet.address);

    const generateJournalistIdResponse = await sendCertificateTxnForJournalist(
      journalist
    );

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
        journalistDetails: newJournalistDetails,
      });
      return;
    } else {
      res.status(500).send({ code: 500, message: "Internal Server Error" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ code: 500, message: "Internal Server Error" });
  }
};
const submitNewsController = async (req, res) => {
  try {
    const {
      _id,
      news_language,
      news_title,
      news_short_description,
      news_category,
      news_tags,
      news_content,
      news_authors,
      news_image,
      is_news_published,
      news_published_link,
      published_timestamp,
      news_published_wallet_address,
    } = req.body;

    const news = req.body;

    // Add any future data
    const newsDetails = {
      // _id,
      news_authors,
    };

    // const wallet = await fetchWalletDetails(); // Implement fetchWalletDetails function
    // console.log(wallet.address);

    const generateNewsIdResponse = await submitNewsTxn(news);

    if (generateNewsIdResponse.success) {
      const newNewsDetails = {
        ...newsDetails,
        news_published_wallet_address:
          news_published_wallet_address ||
          "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
        news_pinata_id: generateNewsIdResponse.newsId,
        // news_id_inBytes: generateNewsIdResponse.newdIdInBytes,
        news_pinata_uri: generateNewsIdResponse.jsonData,
        news_transaction_id: generateNewsIdResponse.txnHash,
      };

      await storeNewsDetails(newNewsDetails);

      // Sending a single argument or an array of arguments
      res.status(200).json({
        newsDetails: newNewsDetails,
      });
      return;
    } else {
      res.status(500).send({ code: 500, message: "Internal Server Error" });
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
