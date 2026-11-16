const Joi = require('joi');

const schemas = {
  login: Joi.object({
    playerName: Joi.string().trim().min(2).max(30).required(),
    roomCode: Joi.string().trim().alphanum().min(4).max(10).optional().allow(''),
  }),

  createRoom: Joi.object({
    hostName: Joi.string().trim().min(2).max(30).required(),
    gameName: Joi.string().trim().max(50).optional().allow(''),
    maxPlayers: Joi.number().integer().min(2).max(100).optional(),
  }),

  joinRoom: Joi.object({
    roomCode: Joi.string().trim().alphanum().min(4).max(10).required(),
    playerName: Joi.string().trim().min(2).max(30).required(),
  }),

  claimWin: Joi.object({
    roomCode: Joi.string().trim().alphanum().min(4).max(10).required(),
    playerToken: Joi.string().uuid().required(),
    pattern: Joi.string()
      .valid('earlyFive', 'topLine', 'middleLine', 'bottomLine', 'fullHouse')
      .required(),
  }),

  bookTicket: Joi.object({
    serialNumber: Joi.string().trim().required().pattern(/^TB-\d{4}$/),
    playerName: Joi.string().trim().min(2).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().trim().min(10).max(15).required(),
  }),
};

function validate(schemaName) {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) return next();

    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map((d) => d.message),
      });
    }
    req.body = value;
    next();
  };
}

module.exports = validate;
