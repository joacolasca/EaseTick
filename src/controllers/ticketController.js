const Router = require('express')
require('dotenv').config();
const TicketService = require('../services/ticketService');

const router = Router();
const svc = new TicketService(); 

router.post("/getClientTicket", async (req, res) => {
    try{
        const datosDashboard = await svc.obtenerDatosDashboard();
        return res.status(201).json({"success": true, "message": datosDashboard});
    } catch(e) {
        return res.status(500).send({ error: `Hubo un error al obtener los datos del dashboard: ${e}` })
    }
});

module.exports = {
    obtenerDatosDashboard,
    TickerRouter: router
};