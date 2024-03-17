const { ObjectId } = require("mongodb");
const {
  storeNewsDetails,
  storeNewsDetailsOfNewId,
  storeUpdatedNewsDetails,
  fetchNewsDetailsFromId,
} = require("../database/functions/newsFunctions.js");
const {
  submitNewsTxn,
} = require("../services/web3");

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
          news_published_parent_wallet_address:
            news.news_published_parent_wallet_address ||
            "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          news_parent_pinata_id: generateNewsIdResponse.newsId,
          news_parent_pinata_uri: generateNewsIdResponse.jsonData,
          news_parent_transaction_id: generateNewsIdResponse.txnHash,
          news_child_mongo_ids: [],
          news_published_wallet_addresses: [
            news.news_published_parent_wallet_address ||
              "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          ],
          news_pinata_ids: [generateNewsIdResponse.newsId],
          // news_id_inBytes: generateNewsIdResponse.newdIdInBytes,
          news_pinata_uris: [generateNewsIdResponse.jsonData],
          news_transaction_ids: [generateNewsIdResponse.txnHash],
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
const updateNewsController = async (req, res) => {
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
      const newsMongoDetails = {
        _id: newObjectId,
      };

      const generateNewsIdResponse = await submitNewsTxn(news);

      if (generateNewsIdResponse.success) {
        const newNewsDetails = {
          ...newsDetails,
          news_published_latest_wallet_address:
            news.news_published_latest_wallet_address ||
            "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          news_latest_pinata_id: generateNewsIdResponse.newsId,
          news_latest_pinata_uri: generateNewsIdResponse.jsonData,
          news_latest_transaction_id: generateNewsIdResponse.txnHash,
        };

        const newNewsMongoDetails = {
          ...newsDetails,
          news_published_parent_wallet_address:
            news.news_published_parent_wallet_address ||
            "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          news_parent_pinata_id: generateNewsIdResponse.newsId,
          news_parent_pinata_uri: generateNewsIdResponse.jsonData,
          news_parent_transaction_id: generateNewsIdResponse.txnHash,
          news_child_mongo_ids: [],
          news_published_wallet_addresses: [
            news.news_published_parent_wallet_address ||
              "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
          ],
          news_pinata_ids: [generateNewsIdResponse.newsId],
          news_pinata_uris: [generateNewsIdResponse.jsonData],
          news_transaction_ids: [generateNewsIdResponse.txnHash],
        };

        await storeNewsDetailsOfNewId(newNewsMongoDetails);
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
  submitNewsController,
  updateNewsController,
};
