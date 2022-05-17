const Joi = require('joi');

const exerciseSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  video: Joi.string().trim().required(),
});

module.exports = { exerciseSchema };
