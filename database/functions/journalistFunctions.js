const connectMongo = require("../connectMongo");

const storeJournalistRegisterDetails = async (data) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("journalists");

    const filter = { _id: data._id };

    const updateResult = await collection.updateOne(
      filter,
      { $set: data },
      { upsert: true }
    );

    console.log("Update Result:", updateResult);

    await client.close();
  } catch (error) {
    console.error("Unable to Run storeJournalistRegisterDetails: ", error);
  }
};

const fetchJournalistsDetails = async () => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("journalists");

    const journalistsCursor = collection.find().sort({ _id: -1 });
    const journalistsArray = await journalistsCursor.toArray();

    console.log("Fetched Journalists", journalistsArray[0]);

    await client.close();
    return journalistsArray;
  } catch (error) {
    console.error("Unable to Run fetchJournalistsDetails: ", error);
  }
};
const fetchJournalistDetailsFromId = async (objectId) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("journalists");

    const data = await collection.findOne({ _id: objectId });
    console.log("Fetched Journalist data from ObjectId: ", data);

    await client.close();
    return data;
  } catch (error) {
    console.error("Unable to run fetchJournalistDetailsFromId: ", error);
  }
};

module.exports = {
  storeJournalistRegisterDetails,
  fetchJournalistsDetails,
  fetchJournalistDetailsFromId,
};
