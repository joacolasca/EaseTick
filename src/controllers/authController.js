const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository'); 

const login = async (req, res) => {
    const { correoelectronico, password } = req.body; // Cambia 'username' por 'correoelectronico'

    try {
        console.log(correoelectronico);
        console.log(password);
        // Buscar el usuario por correoelectronico en la tabla `usuario`
        const usuario = await usuarioRepository.findUsuarioByCorreoElectronico(correoelectronico);

        // Validar si el usuario existe y la contraseña es correcta
        if (!usuario || usuario.contrasena !== password) { // Cambia 'usuario.password' a 'usuario.contrasena'
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        // Crear el token JWT
        const token = jwt.sign(
            { id: usuario.id, correoelectronico: usuario.correoelectronico, fkempresa: usuario.fkempresa }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        return res.json({ token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};


module.exports = { login };
