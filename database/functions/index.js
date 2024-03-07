const connectMongo = require("../connectMongo");

const storeLoginDetails = async () => {};
const storeOrganisationRegisterDetails = async (data) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("organizations");

    const storeOrgDetails = await collection.insertOne(data);

    console.log("Stored Organisation Details", storeOrgDetails);

    await client.close();
  } catch (error) {
    console.error("Unable to Run storeOrganisationsDetails: ", error);
  }
};
const storeJournalistDetails = async (data) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("organizations");

    const journalistDetails = collection.insertOne(data);

    console.log("Stored Journalist Details", journalistDetails);

    await client.close();
  } catch (error) {
    console.error("Unable to Run storeJournalistDetails: ", error);
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

    const orgsCursor = collection.find().sort({ _id: -1 });
    const orgsArray = await orgsCursor.toArray();

    console.log("Fetched Journalists", orgsArray[0]);

    await client.close();
    return orgsArray;
  } catch (error) {
    console.error("Unable to Run fetchJournalistsDetails: ", error);
  }
};

module.exports = {
  storeOrganisationRegisterDetails,
  storeJournalistDetails,
  fetchLoginDetails,
  fetchOrganisationsDetails,
  fetchJournalistsDetails,
};
