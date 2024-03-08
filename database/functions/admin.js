const connectMongo = require("../connectMongo");
const { ObjectId } = require("mongodb");

const storeWallet = async (address, key) => {
  try {
    if (address.length !== 42 || key.length !== 64) {
      return console.log(
        "Lengths of address & key must be 42 & 64 respectively!"
      );
    }

    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("wallets");

    const walletDocument = {
      address: address,
      key: key,
      //   used: false,
    };

    const storeWalletDetails = await collection.insertOne(walletDocument);

    console.log("Stored wallet Details are: ", storeWalletDetails);

    await client.close();
  } catch (error) {
    console.error("Unable to run Store Wallet function: ", error);
  }
};

const storeWallets = async (walletsArray) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("wallets");

    const formattedWalletsArray = walletsArray.map((wallet) => ({
      _id: new ObjectId(),
      address: wallet.address,
      key: wallet.key,
    }));

    const storeWalletDetails = await collection.insertMany(
      formattedWalletsArray
    );

    console.log("Stored wallet details are: ", storeWalletDetails);

    await client.close();
  } catch (error) {
    console.error("Unable to store wallets: ", error);
  }
};

const fetchWalletDetails = async () => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("wallets");

    const walletCursor = collection.find().sort({ _id: -1 });
    const walletsArray = await walletCursor.toArray();

    console.log("Fetched Wallet: ", walletsArray[0]);

    await client.close();
    return walletsArray[0];
  } catch (error) {
    console.error("Unable to Run fetchWalletDetails: ", error);
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
const fetchNewsDetailsFromId = async (objectId) => {
  try {
    const client = await connectMongo();
    const db = client.db("Xcheck_db");
    const collection = db.collection("news");

    const data = await collection.findOne({ _id: objectId });
    console.log("Fetched News data from ObjectId: ", data);

    await client.close();
    return data;
  } catch (error) {
    console.error("Unable to run fetchNewsDetailsFromId: ", error);
  }
};

// Example usage
const walletsArray = [
  {
    address: "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
    key: "private_key_1",
  },
  {
    address: "...",
    key: "private_key_2",
  },
];

// storeWallet(
//   "0x1c620232Fe5Ab700Cc65bBb4Ebdf15aFFe96e1B5",
//   "1847f5b9f27a33f004471d310fdf94340f59b5134e1aee8eeb4ab3a6e8defe43"
// );

module.exports = {
  storeWallet,
  storeWallets,
  fetchWalletDetails,
  fetchOrganizationDetailsFromId,
  fetchJournalistDetailsFromId,
  fetchNewsDetailsFromId,
};
