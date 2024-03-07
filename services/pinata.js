require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function uploadFile(fileName, fileContent) {
  try {
    const formData = new FormData();
    const fileBuffer = Buffer.from(fileContent, "utf-8"); // Specify encoding

    formData.append("file", fileBuffer, {
      filename: `${fileName}`,
    });

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    console.log(res.data);
    return res.data.IpfsHash;
  } catch (error) {
    console.error(error);
  }
}

module.exports = uploadFile;
