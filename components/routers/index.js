const express = require("express");
const connectMongo = require("../../database/connectMongo.js");
const {
  fetchOrganisationsDetails,
  fetchJournalistsDetails,
} = require("../../database/functions/index.js");
const {
  loginController,
  orgRegisterController,
  journalistRegisterController,
} = require("../controllers/index.js");
const {
  LoginSchema,
  OrgRegistrationSchema,
  JournalistRegistrationSchema,
  OrgLoginSchema,
  JournalistLoginSchema,
} = require("../validators/index.js");
const validateSchema = require("../validators/validateSchema.js");

const apiRouter = express.Router();

apiRouter.post(
  "/login",
  // validateSchema(LoginSchema),
  loginController
);
apiRouter.get(
  "/login",
  // validateSchema(LoginSchema),
  loginController
);
apiRouter.post(
  "/org/register",
  validateSchema(OrgRegistrationSchema),
  orgRegisterController
);
apiRouter.post( 
  "/journalist/register",
  validateSchema(JournalistRegistrationSchema),
  journalistRegisterController
);
apiRouter.get(
  "/org/register",
  // validateSchema(OrgRegistrationSchema),
  orgRegisterController
);
apiRouter.get("/orgs", fetchOrganisationsDetails);
apiRouter.get("/journalists", fetchJournalistsDetails);
apiRouter.get(
  "/journalist/register",
  // validateSchema(JournalistRegistrationSchema),
  journalistRegisterController
);

module.exports = apiRouter;
