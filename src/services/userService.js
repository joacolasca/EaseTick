const UserRepository = require('../repositories/userRepository');

class UserService {
    async obtenerPerfilUsuario(id) {
        try {
            const repo = new UserRepository();
            const perfil = await repo.obtenerPerfilUsuario(id);
            return perfil;
        } catch (error) {
            throw new Error(`Error al obtener perfil de usuario: ${error.message}`);
        }
    } 
}
module.exports = { UserService };