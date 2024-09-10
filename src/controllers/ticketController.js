const { Router } = require('express');
require('dotenv').config();
const TicketService = require('../services/ticketService');
const req = require('express/lib/request');
const res = require('express/lib/response');

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

router.get("/FeedBackEmpleado/:id", async (req, res) => {
    const {id} = req.params;
    try{
        const tickets = await svc.obtenerFeedbackDeEmpleado(id);
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener el feedback del empleado: ${e.message}` });
    }
});
router.get("/porcentajeTicketsResueltos/:id", async (req, res) => {
    const {id} = req.params;
    try{
        const tickets = await svc.obtenerPorcentajeTicketsResueltos(id);
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener el porcentaje de tickets: ${e.message}` });
    }
});
router.get("/detalleTicket/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const ticketDetail = await svc.obtenerDetalleDeTicketDeEmpleado(id);
        return res.status(200).json({ success: true, message: ticketDetail });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener el detalle del ticket: ${e.message}` });
    }
});
router.get("/ticketsPorDiaDeLaSemana/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const ticketsPorDia = await svc.obtenerTicketsPorDiaDeLaSemana(id);
        return res.status(200).json({ success: true, message: ticketsPorDia });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los tickets por día de la semana: ${e.message}` });
    }
});
router.get("/ticketsResueltosPorDiaDeLaSemana/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const ticketsResueltosPorDia = await svc.obtenerTicketsResueltosPorDiaDeLaSemana(id);
        return res.status(200).json({ success: true, message: ticketsResueltosPorDia });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los tickets resueltos por día de la semana: ${e.message}` });
    }
});
router.get("/cantidadTicketsPorPrioridad/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const cantidadTicketsPorPrioridad = await svc.obtenerCantidadTicketsPorPrioridad(id);
        return res.status(200).json({ success: true, message: cantidadTicketsPorPrioridad });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener la cantidad de tickets por prioridad: ${e.message}` });
    }
});
router.get("/porcentajeTicketsPorEstado/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const porcentajeTicketsPorEstado = await svc.obtenerPorcentajeTicketsPorEstado(id);
        return res.status(200).json({ success: true, message: porcentajeTicketsPorEstado });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener el porcentaje de tickets por estado: ${e.message}` });
    }
});


module.exports = router;
