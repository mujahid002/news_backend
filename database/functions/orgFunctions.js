const connectMongo = require("../connectMongo");

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
const fetchOrganisationsUsingOrgCategory = async (orgCategory) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("organizations");

    const orgsArray = await collection
      .find({ org_category: orgCategory })
      .toArray();

    console.log("Fetched Organisations by Org Type:", orgCategory);

    await client.close();
    return orgsArray;
  } catch (error) {
    console.error("Unable to run fetchOrganisationsUsingOrgCategory: ", error);
  }
};
const fetchOrganizationDetailsFromId = async (objectId) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("organizations");

    const data = await collection.findOne({ _id: objectId });
    console.log("Fetched Organization data from ObjectId: ", data);

    await client.close();
    return data;
  } catch (error) {
    console.error("Unable to run fetchOrganizationDetailsFromId: ", error);
  }
};

module.exports = {
  storeOrganisationRegisterDetails,
  fetchOrganisationsDetails,
  fetchOrganisationsUsingOrgCategory,
  fetchOrganizationDetailsFromId,
};
