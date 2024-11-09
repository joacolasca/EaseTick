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

const obtenerPerfilEmpleadoCompleto = async (id) => {
    try {
        const usuario = await usuarioRepository.obtenerPerfilEmpleadoCompleto(id);
        if (!usuario) {
            throw new Error('Empleado no encontrado');
        }
        return usuario;
    } catch (error) {
        throw new Error(`Error al obtener perfil completo del empleado: ${error.message}`);
    }
};

const obtenerPerfilClienteCompleto = async (id) => {
    try {
        const usuario = await usuarioRepository.obtenerPerfilClienteCompleto(id);
        if (!usuario) {
            throw new Error('Cliente no encontrado');
        }
        return usuario;
    } catch (error) {
        throw new Error(`Error al obtener perfil completo del cliente: ${error.message}`);
    }
};

module.exports = { 
    findByEmail,
    obtenerPerfilEmpleadoCompleto,
    obtenerPerfilClienteCompleto
};
