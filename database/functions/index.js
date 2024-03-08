const connectMongo = require("../connectMongo");

const storeLoginDetails = async () => {};
const storeOrganisationRegisterDetails = async (data) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("organizations");

    const filter = { _id: data._id };

    const updateResult = await collection.updateOne(
      filter,
      { $set: data },
      { upsert: true }
    );

    console.log("Update Result:", updateResult);

    await client.close();
  } catch (error) {
    console.error("Unable to run storeOrganisationsDetails: ", error);
    throw error;
  }
};

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
const storeNewsDetails = async (data) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("news");

    const filter = { _id: data._id };

    const updateResult = await collection.updateOne(
      filter,
      { $set: data },
      { upsert: true }
    );

    console.log("Update Result:", updateResult);

    if (updateResult.modifiedCount === 0 && updateResult.upsertedCount === 0) {
      console.log("No document matched the filter criteria.");
    }

    await client.close();
  } catch (error) {
    console.error("Error in storeNewsDetails: ", error);
  }
};

const fetchLoginDetails = async () => {};
const fetchOrganisationsDetails = async () => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("organizations");

    const orgsCursor = collection.find().sort({ _id: -1 });
    const orgsArray = await orgsCursor.toArray();

    console.log("Fetched Organisations", orgsArray[0]);

    await client.close();
    return orgsArray;
  } catch (error) {
    console.error("Unable to Run fetchOrganisationsDetails: ", error);
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
const fetchNews = async () => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("news");

    const newsCursor = collection.find().sort({ _id: -1 });
    const newsArray = await newsCursor.toArray();

    console.log("Fetched Journalists", newsArray[0]);

    await client.close();
    return newsArray;
  } catch (error) {
    console.error("Unable to Run fetchJournalistsDetails: ", error);
  }
};

module.exports = {
  storeOrganisationRegisterDetails,
  storeJournalistRegisterDetails,
  fetchLoginDetails,
  fetchOrganisationsDetails,
  fetchJournalistsDetails,
  storeNewsDetails,
  fetchNews,
};
