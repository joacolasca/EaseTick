const jwt = require('jsonwebtoken');
const usuarioRepository = require('../repositories/usuarioRepository');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
    const { correoelectronico, password } = req.body;

    try {
        const usuario = await usuarioRepository.findUsuarioByCorreoElectronico(correoelectronico);

        if (!usuario) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const passwordMatch = await bcrypt.compare(password, usuario.contrasena);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id: usuario.id, correoelectronico: usuario.correoelectronico, fkempresa: usuario.fkempresa },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            token,
            fkrol: usuario.fkrol
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { login };
