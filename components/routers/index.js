const express = require("express");
const connectMongo = require("../../database/connectMongo.js");
const {
  fetchOrganisationsDetails,
  fetchJournalistsDetails,
  fetchNews,
} = require("../../database/functions/index.js");
const {
  loginController,
  orgRegisterController,
  journalistRegisterController,
  submitNewsController,
} = require("../controllers/index.js");
const {
  LoginSchema,
  OrgRegistrationSchema,
  JournalistRegistrationSchema,
  OrgLoginSchema,
  JournalistLoginSchema,
  NewsDetailsSchema,
} = require("../validators/index.js");
const validateSchema = require("../validators/validateSchema.js");

const apiRouter = express.Router();

apiRouter.post(
  "/login",
  // validateSchema(LoginSchema),
  loginController
);
apiRouter.post(
  "/org/register",
  // validateSchema(OrgRegistrationSchema),
  orgRegisterController
);
apiRouter.post(
  "/journalist/register",
  validateSchema(JournalistRegistrationSchema),
  journalistRegisterController
);
apiRouter.post(
  "/news/submit-news",
  validateSchema(NewsDetailsSchema),
  submitNewsController
);
apiRouter.get("/organizations", async (req, res) => {
  const data = await fetchOrganisationsDetails();
  res.status(200).json({ organizations: data });
});
apiRouter.get("/journalists", async (req, res) => {
  const data = await fetchJournalistsDetails();
  res.status(200).json({ journalists: data });
});
apiRouter.get("/news", async (req, res) => {
  const data = await fetchNews();
  res.status(200).json({ news: data });
});

module.exports = apiRouter;
