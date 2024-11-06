const usuarioRepository = require('../repositories/usuarioRepository');

const findByEmail = async (email) => {
    try {
        const usuario = await usuarioRepository.findUsuarioByCorreoElectronico(email);
        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        return usuario;
    } catch (error) {
        throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
};

module.exports = { findByEmail };
