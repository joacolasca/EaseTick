const ticketService = require('../services/ticketService');

const obtenerDatosDashboard = async (req, res) => {
    try {
        const datosDashboard = await ticketService.obtenerDatosDashboard();
        res.status(200).json(datosDashboard);
    } catch (error) {
        console.error('Error en obtenerDatosDashboard:', error.message);
        res.status(500).json({ error: 'Hubo un error al obtener los datos del dashboard.' });
    }
};

module.exports = {
    obtenerDatosDashboard,
};
