const Joi = require("joi");

/**
 * Utility helper for Joi validation.
 *
 * @param <T> data
 * @param <Joi.Schema> schema
 * @returns <Promise>
 */
async function validate(data, schema) {
  return await schema.validateAsync(data, { abortEarly: false });
}

/**
 * A Validator to validate schema.
 *
 * @param {Joi.Schema} params
 */
function validateSchema(params) {
  return async (req, res, next) => {
    try {
      await validate(req.body, params);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = validateSchema;
