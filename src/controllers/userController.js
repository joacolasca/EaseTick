const express = require('express');
const { UserService } = require('../services/userService');

const router = express.Router();
const svc = new UserService();

router.get("/perfil/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const perfil = await svc.obtenerPerfilUsuario(parseInt(id));
        return res.status(200).json({ success: true, data: perfil });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: `Error al obtener perfil: ${error.message}` 
        });
    }
});

module.exports = router; 