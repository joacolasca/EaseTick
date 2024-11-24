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

router.post('/crear-cliente', async (req, res) => {
    try {
        const { nombre, correoelectronico, contrasena, fkempresa } = req.body;
        
        const { data: existingUser } = await supabase
            .from('usuario')
            .select('correoelectronico')
            .eq('correoelectronico', correoelectronico)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        const { data: userData, error: userError } = await supabase
            .from('usuario')
            .insert([{
                nombre,
                correoelectronico,
                contrasena: hashedPassword,
                fkrol: 1,
                fkempresa
            }])
            .select();

        if (userError) throw userError;

        return res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: userData[0]
        });
    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/empresas/crear', async (req, res) => {
    try {
        const { nombre, correoelectronico, telefono, tipo } = req.body;
        
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresa')
            .insert([{
                nombre,
                correoelectronico,
                telefono,
                tipo,
                esCliente: true
            }])
            .select();

        if (empresaError) throw empresaError;

        return res.status(201).json({
            success: true,
            message: 'Empresa creada exitosamente',
            data: empresaData[0]
        });
    } catch (error) {
        console.error('Error al crear empresa:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/crear-empleado', async (req, res) => {
    try {
        const { nombre, correoelectronico, contrasena, fkempresa } = req.body;
        
        // Check if email already exists
        const { data: existingUser } = await supabase
            .from('usuario')
            .select('correoelectronico')
            .eq('correoelectronico', correoelectronico)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        const hashedPassword = await bcrypt.hash(contrasena, 10);
        
        // Create new user record
        const { data: userData, error: userError } = await supabase
            .from('usuario')
            .insert([{
                nombre,
                correoelectronico,
                contrasena: hashedPassword,
                fkrol: 2, // Employee role
                fkempresa
            }])
            .select();

        if (userError) {
            console.error('Error creating employee:', userError);
            throw userError;
        }

        return res.status(201).json({
            success: true,
            message: 'Empleado creado exitosamente',
            data: userData[0]
        });
    } catch (error) {
        console.error('Error creating employee:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/empresas', async (req, res) => {
    try {
        const { data: empresas, error } = await supabase
            .from('empresa')
            .select('id, nombre')
            .eq('esCliente', true);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            data: empresas
        });
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/empresas-no-clientes', async (req, res) => {
    try {
        const { data: empresas, error } = await supabase
            .from('empresa')
            .select('id, nombre')
            .eq('esCliente', false);

        if (error) throw error;

        return res.status(200).json({
            success: true,
            data: empresas
        });
    } catch (error) {
        console.error('Error al obtener empresas:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.get('/perfil-miembro/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const perfilMiembro = await usuarioService.obtenerPerfilMiembroCompleto(id);
        return res.status(200).json({
            success: true,
            data: perfilMiembro
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

router.put('/cambiar-email', async (req, res) => {
    try {
        const { email, nuevoEmail } = req.body;
        
        // Verificar si el nuevo email ya existe
        const { data: existingUser } = await supabase
            .from('usuario')
            .select('correoelectronico')
            .eq('correoelectronico', nuevoEmail)
            .single();

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El nuevo correo electrónico ya está registrado'
            });
        }

        // Actualizar el email
        const { data, error } = await supabase
            .from('usuario')
            .update({ correoelectronico: nuevoEmail })
            .eq('correoelectronico', email)
            .select();

        if (error) {
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Email actualizado correctamente',
            data: data[0]
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el email',
            error: error.message
        });
    }
});

module.exports = router; 