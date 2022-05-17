const Joi = require('joi');

const setsSchema = Joi.object({
  weight: Joi.number().required(),
  reps: Joi.number().required(),
  sets: Joi.number().required(),
  exercise_id: Joi.string().required(),
});

module.exports = { setsSchema };
