const express = require("express");
const connectMongo = require("../../database/connectMongo.js");
const {
  fetchOrganisationsDetails,
  fetchOrganisationsUsingOrgCategory,
} = require("../../database/functions/orgFunctions.js");
const {
  fetchJournalistsDetails,
} = require("../../database/functions/journalistFunctions.js");
const {
  fetchNews,
  fetchNewsUsingNewsLanguage,
} = require("../../database/functions/newsFunctions.js");
const { loginController } = require("../../controllers/index.js");
const {
  orgRegisterController,
  journalistRegisterController,
  factCheckController,
} = require("../../controllers/registerControllers.js");
const {
  submitNewsController,
  updateNewsController,
} = require("../../controllers/newsControllers.js");
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
  // validateSchema(JournalistRegistrationSchema),
  journalistRegisterController
);
apiRouter.post(
  "/news/submit-news",
  // validateSchema(NewsDetailsSchema),
  submitNewsController
);
apiRouter.post(
  "/news/update-news",
  // validateSchema(NewsDetailsSchema),
  updateNewsController
);
apiRouter.post(
  "/news/fact-check",
  // validateSchema(NewsDetailsSchema),
  factCheckController
);
apiRouter.get("/organizations", async (req, res) => {
  const orgCategory = req.query.org_category;
  console.log("orgCategory", orgCategory);

  if (orgCategory) {
    const data = await fetchOrganisationsUsingOrgCategory(orgCategory);
    res.status(200).json({ organizations_by_org_category: data });
  } else {
    const data = await fetchOrganisationsDetails();
    res.status(200).json({ organizations: data });
  }
});
// apiRouter.get("/organizations", async (req, res) => {
//   const orgCategory = req.params.org_category;
//   console.log("orgCategory", orgCategory);
//   const data = await fetchOrganisationsUsingOrgCategory(orgCategory);
//   res.status(200).json({ organizations_by_org_category: data });
// });

apiRouter.get("/journalists", async (req, res) => {
  const data = await fetchJournalistsDetails();
  res.status(200).json({ journalists: data });
});
apiRouter.get("/news", async (req, res) => {
  const newsLanguage = req.query.news_language;
  if (newsLanguage) {
    const data = await fetchNewsUsingNewsLanguage(newsLanguage);
    res.status(200).json({ news_by_Language: data });
  } else {
    const data = await fetchNews();
    res.status(200).json({ news: data });
  }
});

module.exports = apiRouter;
