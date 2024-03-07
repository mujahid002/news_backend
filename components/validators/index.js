const Joi = require("joi");

const LoginSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    username: Joi.string().required().label("username"),
    password: Joi.string().required().label("password"),
  });

const { error: loginError, value: loginValue } = LoginSchema.validate({
  username: "username",
  password: "password",
});

const OrgRegistrationSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    org_name: Joi.string().required().label("org_name"),
    org_legal_name: Joi.string().required().label("org_legal_name"),
    org_legal_type: Joi.string()
      .valid(
        "LLC",
        "Pvt. Ltd.",
        "Ltd.",
        "OPC",
        "Proprietorship",
        "Unregistered",
        "Other"
      )
      .required()
      .label("org_legal_type"),
    org_category: Joi.string()
      .valid("local", "national")
      .required()
      .label("org_category"),
    org_website: Joi.array()
      .items(Joi.string())
      .optional()
      .label("org_website"),
    org_contact_emails: Joi.array()
      .items(Joi.string().email())
      .label("org_contact_emails"),
    org_contact_numbers: Joi.array()
      .items(Joi.string())
      .label("org_contact_numbers"),
    org_type: Joi.string()
      .valid("news publisher", "news agency", "fact checker")
      .required()
      .label("org_type"),
    org_username: Joi.string().required().label("org_username"),
    org_password: Joi.string().required().label("org_password"),
    whitelisted_ips: Joi.array()
      .items(Joi.string())
      .optional()
      .label("whitelisted_ips"),
  });

const JournalistRegistrationSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    journalist_first_name: Joi.string()
      .required()
      .label("journalist_first_name"),
    journalist_last_name: Joi.string().required().label("journalist_last_name"),
    org_id: Joi.string().optional().label("org_id"),
    category: Joi.array().items(Joi.string()).required().label("category"),
    about_journalist: Joi.string().required().label("about_journalist"),
    journalist_email: Joi.string().email().required().label("journalist_email"),
    journalist_website: Joi.string().optional().label("journalist_website"),
    journalist_contact: Joi.string().optional().label("journalist_contact"),
    journalist_username: Joi.string().required().label("journalist_username"),
    journalist_password: Joi.string().required().label("journalist_password"),
  });

const OrgLoginSchema = Joi.object({
  org_username: Joi.string().required().label("org_username"),
  org_password: Joi.string().required().label("org_password"),
}).options({ abortEarly: false });

const JournalistLoginSchema = Joi.object({
  journalist_username: Joi.string().required().label("journalist_username"),
  journalist_password: Joi.string().required().label("journalist_password"),
}).options({ abortEarly: false });

const { error: orgValidateError, value: orgValidateValue } =
  OrgLoginSchema.validate({
    org_username: "exampleUsername",
    org_password: "examplePassword",
  });

const { error: journalistValidateError, value: journalistValidateValue } =
  JournalistLoginSchema.validate({
    journalist_username: "exampleJournalistUsername",
    journalist_password: "exampleJournalistPassword",
  });

module.exports = {
  LoginSchema,
  OrgRegistrationSchema,
  JournalistRegistrationSchema,
  OrgLoginSchema,
  JournalistLoginSchema,
};
