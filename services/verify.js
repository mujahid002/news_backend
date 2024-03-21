const { ObjectId } = require("mongodb");
const ethers = require("ethers");
const { testNewsContract } = require("../constants/index.js");
const verifyNewsCidController = async (req, res) => {
  const { cid, userAddress } = req.body;
  try {
    // Retrieve the token ID of the user
    const tokenId = BigInt(
      await testNewsContract.getTokenIdOfAnUser(userAddress)
    );

    // Call the verifyCid function of the contract
    const verifyCall = await testNewsContract.verifyCid(tokenId, cid);

    // Check the result and send appropriate response
    if (verifyCall) {
      res.status(200).json({ statusOfCid: "present" });
    } else {
      res.status(200).json({ statusOfCid: "not-present" });
    }
  } catch (error) {
    console.error("Unable to run verifyNewsCidController ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyFactCidController = async (req, res) => {
  const { cid, factCid } = req.body;

  try {
    // const tokenId = BigInt(
    //   await testNewsContract.getTokenIdOfAnUser(userAddress)
    // );

    const verifyCall = await testNewsContract.verifyFactCheckerCid(
      cid,
      factCid
    );
    if (verifyCall) {
      res.status(200).json({ statusOfCid: "present" });
    } else {
      res.status(200).json({ statusOfCid: "not-present" });
    }
  } catch (error) {
    console.log("unable to run verifyFactCidController ", error);
  }
};

module.exports = { verifyNewsCidController, verifyFactCidController };
