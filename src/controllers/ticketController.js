const { Router } = require('express');
require('dotenv').config();
const TicketService = require('../services/ticketService');

const router = Router();
const svc = new TicketService();

router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const tickets = await svc.obtenerTicketsDeEmpleado(id);
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los datos del dashboard: ${e.message}` });
    }
});

router.get("/ticketsSinResolver/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const tickets = await svc.obtenerTicketsSinResolverDeEmpleado(id);
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los tickets sin resolver: ${e.message}` });
    }
});

router.get("/ticketsResueltos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const tickets = await svc.obtenerTicketsResueltosDeEmpleado(id);
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los tickets resueltos: ${e.message}` });
    }
});

router.get("/ticketsVencenHoy/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const tickets = await svc.obtenerTicketsVencenHoyDeEmpleado(id);
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los tickets que vencen hoy: ${e.message}` });
    }
});

module.exports = router;
