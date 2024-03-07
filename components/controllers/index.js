const {
  storeOrganisationRegisterDetails,
} = require("../../database/functions/index");
const { fetchWalletDetails } = require("../../database/functions/admin");
const {
  generateUniqueOrgIdTxn,
  generateUniqueJournalistIdTxn,
  sendCertificateTxnForOrg,
} = require("../../services/web3");

const loginController = async (req, res) => {
  res.send("Login controller function running");
};

const orgRegisterController = async (req, res) => {
  try {
    const {
      org_name,
      org_legal_name,
      org_legal_typeorg_category,
      org_website,
      org_contact_emails,
      org_contact_numbers,
      org_type,
      org_username,
      org_password,
    } = req.body;

    const organisation = req.body;

    const orgDetails = {
      org_api_key: "working...",
      org_api_secrect: "working...",
      organisation,
    };

    const wallet = await fetchWalletDetails();
    console.log(wallet.address);
    // const generateOrgIdResponse = await generateUniqueOrgIdTxn(
    //   wallet.address,
    //   org_username
    // );
    const generateOrgIdResponse = await sendCertificateTxnForOrg(
      wallet.address,
      organisation
    );

    if (generateOrgIdResponse.success) {
      const newOrgDetails = {
        ...orgDetails,
        org_id: generateOrgIdResponse.orgId,
        org_wallet_address: wallet.address,
        org_private_key: wallet.key,
        org_transaction_id: generateOrgIdResponse.txnHash,
        org_pinata_uri: generateOrgIdResponse.jsonData,
      };

      await storeOrganisationRegisterDetails(newOrgDetails);

      // Sending a single argument or an array of arguments
      res.status(200).json({
        orgDetails: newOrgDetails,
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
      journalist_password,
    } = req.body;

    const journalistDetails = {};

    const wallet = await fetchWalletDetails(); // Implement fetchWalletDetails function
    console.log(wallet.address);

    const generateJournalistIdResponse = await generateUniqueJournalistIdTxn(
      wallet.address,
      journalist_username
    );

    if (generateJournalistIdResponse.success) {
      const newJournalistDetails = {
        ...journalistDetails,
        journalist_id: generateJournalistIdResponse.journalistId,
        journalist_wallet_address: wallet.address,
        journalist_private_key: wallet.key,
      };

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

module.exports = {
  loginController,
  orgRegisterController,
  journalistRegisterController,
};
