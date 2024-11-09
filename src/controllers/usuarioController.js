const express = require('express');
const usuarioService = require('../services/usuarioService');
const bcrypt = require('bcrypt');
const supabase = require('../configs/supabase');

const router = express.Router();

router.get('/byEmail/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const usuario = await usuarioService.findByEmail(email);
        return res.status(200).json({
            success: true,
            data: usuario
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const usuario = await usuarioService.findByEmail(email);
        
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Usando Supabase para actualizar la contraseña
        const { data, error } = await supabase
            .from('usuario')
            .update({ contrasena: hashedPassword })
            .eq('id', usuario.id);
        
        if (error) {
            return res.status(500).json({ 
                message: 'Error al actualizar la contraseña en la base de datos',
                error: error.message 
            });
        }
        
        res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            message: 'Error interno del servidor al actualizar la contraseña',
            error: error.message 
        });
    }
});

router.get('/perfil-empleado/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const perfilEmpleado = await usuarioService.obtenerPerfilEmpleadoCompleto(id);
        return res.status(200).json({
            success: true,
            data: perfilEmpleado
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.get('/perfil-cliente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const perfilCliente = await usuarioService.obtenerPerfilClienteCompleto(id);
        return res.status(200).json({
            success: true,
            data: perfilCliente
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 