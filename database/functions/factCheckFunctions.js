const { set } = require("mongoose");
const connectMongo = require("../connectMongo");

const storeUpdatedFactCheckerDetails = async (data) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("fact_check");

    const filter = { _id: data._id };
    const { _id, ...updateData } = data; // Exclude _id from updateData

    const updateResult = await collection.updateOne(
      filter,
      { $set: updateData },
      { upsert: true }
    );

    console.log("Update Result:", updateResult);

    if (updateResult.modifiedCount === 0 && updateResult.upsertedCount === 0) {
      console.log("No document matched the filter criteria.");
    }

    await client.close();
  } catch (error) {
    console.error("Error in storeUpdatedNewsDetails: ", error);
  }
};

const fetchFactCheckerDetailsFromId = async (objectId) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("fact_check");

    const data = await collection.findOne({ _id: objectId });
    console.log("Fetched Fact Check data from ObjectId: ", data);

    await client.close();
    return data;
  } catch (error) {
    console.error("Unable to run fetchNewsDetailsFromId: ", error);
  }
};

module.exports = {
  storeUpdatedFactCheckerDetails,
  fetchFactCheckerDetailsFromId,
};
