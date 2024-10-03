const usuarioRepository = require('../repositories/usuarioRepository');

const findByUsername = async (username) => {
  return await usuarioRepository.findByUsername(username);
};

module.exports = { findByUsername };
