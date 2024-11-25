const { Router } = require('express');
require('dotenv').config();
const TicketService = require('../services/ticketService');
const req = require('express/lib/request');
const res = require('express/lib/response');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    }
});

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
router.get("/:id/mensajes", async (req, res) => {
    const { id } = req.params;
    try {
        const mensajes = await svc.obtenerMensajesDeTicket(id);
        return res.status(200).json({ success: true, mensajes });
    } catch (e) {
        return res.status(500).json({ error: `Error al obtener mensajes: ${e.message}` });
    }
});
router.post("/:id/mensaje", upload.single('archivo'), async (req, res) => {
    const { id } = req.params;
    const { contenido, userId, isEmployee } = req.body;
    const archivo = req.file;

    try {
        const mensaje = await svc.enviarMensaje(
            id, 
            userId, 
            contenido || '', 
            isEmployee === 'true', 
            archivo
        );

        const io = req.app.get('io');
        if (io) {
            io.to(`ticket-${id}`).emit('message-received', mensaje);
        }

        return res.status(200).json({ 
            success: true, 
            mensaje 
        });
    } catch (error) {
        console.error('Error en controlador mensaje:', error);
        return res.status(500).json({ 
            success: false,
            error: error.message
        });
    }
});
router.post("/:id/cerrar", async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await svc.cerrarTicket(id);
        if (resultado.success) {
            return res.status(200).json({
                success: true,
                message: 'Ticket cerrado exitosamente'
            });
        } else {
            throw new Error('No se pudo cerrar el ticket');
        }
    } catch (error) {
        console.error('Error en controlador cerrarTicket:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

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
router.get("/cantidadTicketsPorTipo/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const cantidadTicketsPorTipo = await svc.obtenerCantidadTicketsPorTipo(id);
        return res.status(200).json({ success: true, message: cantidadTicketsPorTipo });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener la cantidad de tickets por tipo: ${e.message}` });
    }
});
router.get("/calificacionesPorUsuario/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const calificacionesPorUsuario = await svc.obtenerCalificacionesPorUsuario(id);
        return res.status(200).json({ success: true, message: calificacionesPorUsuario });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener la cantidad de calificaciones por usuario: ${e.message}` });
    }
});
router.post("/agregar", async (req, res) => {
    const { texto, fkusuario } = req.body;
    
    try {
        const resultado = await svc.agregarRecordatorio(texto, fkusuario);
        return res.status(200).json({ 
            success: true, 
            recordatorio: resultado.recordatorio, 
            usuario: resultado.usuario 
        });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al agregar el recordatorio: ${e.message}` });
    }
});

// Obtener los recordatorios de un usuario
router.get("/obtenerRecordatorios/:fkusuario", async (req, res) => {
    const { fkusuario } = req.params;
    try {
        const recordatorios = await svc.obtenerRecordatorios(fkusuario);
        return res.status(200).json({ success: true, message: recordatorios });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los recordatorios: ${e.message}` });
    }
});

// Eliminar un recordatorio
router.delete("/eliminarRecordatorio/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await svc.eliminarRecordatorio(id);
        return res.status(200).json({ success: true, message: 'Recordatorio eliminado con éxito' });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al eliminar el recordatorio: ${e.message}` });
    }
});
router.get("/empresasClientes/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const empresas = await svc.obtenerEmpresasClientesPorUsuario(id);
        return res.status(200).json({ success: true, message: empresas });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener las empresas clientes: ${e.message}` });
    }
});
router.get("/empleadosYTickets/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const empleados = await svc.obtenerEmpleadosYTicketsPorUsuario(id);
        return res.status(200).json({ success: true, message: empleados });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los empleados y tickets: ${e.message}` });
    }
});

router.post("/crear", async (req, res) => {
    const { asunto, mensaje, idCliente, idEmpresa, tipo, prioridad } = req.body;
    try {
        const ticketService = new TicketService();
        const resultado = await ticketService.crearTicket(asunto, mensaje, idCliente, idEmpresa, tipo, prioridad);
        return res.status(200).json({ success: true, data: resultado });
    } catch (e) {
        return res.status(500).send({ error: `Error al crear el ticket: ${e.message}` });
    }
});


router.post("/responder", async (req, res) => {
    const { idTicket, mensaje, idUsuario, esEmpleado } = req.body;
    
    if (!idTicket) {
        return res.status(400).json({ error: "idTicket es requerido" });
    }

    try {
        const ticketService = new TicketService();
        const resultado = await ticketService.responderTicket(idTicket, mensaje, idUsuario, esEmpleado);
        return res.status(200).json({ success: true, data: resultado });
    } catch (e) {
        return res.status(500).json({ error: `Error al responder el ticket: ${e.message}` });
    }
});

router.get("/informacionCompleta/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const ticketInfo = await svc.obtenerInformacionCompletaDeTicket(id);
        return res.status(200).json({ success: true, message: ticketInfo });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener la información completa del ticket: ${e.message}` });
    }
});

router.get("/cliente/:id", async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ error: "ID de cliente inválido" });
    }
    try {
        const tickets = await svc.obtenerTicketsDeCliente(parseInt(id, 10));
        return res.status(200).json({ success: true, message: tickets });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener los tickets del cliente: ${e.message}` });
    }
});

router.get("/equipo/:id", async (req, res) => {
    const { id } = req.params;
    if (isNaN(id)) {
        return res.status(400).json({ error: "ID de cliente inválido" });
    }
    try {
        const equipo = await svc.obtenerEquipoCliente(parseInt(id, 10));
        return res.status(200).json({ success: true, message: equipo });
    } catch (e) {
        return res.status(500).send({ error: `Hubo un error al obtener el equipo del cliente: ${e.message}` });
    }
});

router.get("/estado/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const ticket = await svc.obtenerTicket(id);
        return res.status(200).json({ 
            success: true, 
            estado: ticket.fkestado 
        });
    } catch (e) {
        return res.status(500).json({ 
            error: `Error al obtener estado del ticket: ${e.message}` 
        });
    }
});

// Total tickets por cliente
router.get("/totalTicketsCliente/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const total = await svc.obtenerTotalTicketsCliente(id);
        return res.status(200).json({ success: true, message: total });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener total de tickets: ${e.message}` });
    }
});

// Tickets por estado del cliente
router.get("/ticketsPorEstadoCliente/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const distribucion = await svc.obtenerTicketsPorEstadoCliente(id);
        return res.status(200).json({ success: true, message: distribucion });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener distribución de estados: ${e.message}` });
    }
});

// Tickets por prioridad del cliente
router.get("/ticketsPorPrioridadCliente/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const distribucion = await svc.obtenerTicketsPorPrioridadCliente(id);
        return res.status(200).json({ success: true, message: distribucion });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener distribución de prioridades: ${e.message}` });
    }
});

// Tiempo promedio de resolución
router.get("/tiempoPromedioResolucionCliente/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const promedio = await svc.obtenerTiempoPromedioResolucionCliente(id);
        return res.status(200).json({ success: true, message: promedio });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener tiempo promedio: ${e.message}` });
    }
});

// Tickets por tipo del cliente
router.get("/ticketsPorTipoCliente/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const distribucion = await svc.obtenerTicketsPorTipoCliente(id);
        return res.status(200).json({ success: true, message: distribucion });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener distribución por tipo: ${e.message}` });
    }
});

// Tendencia semanal de tickets del cliente
router.get("/tendenciaSemanalCliente/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const tendencia = await svc.obtenerTendenciaSemanalCliente(id);
        return res.status(200).json({ success: true, message: tendencia });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener tendencia semanal: ${e.message}` });
    }
});

// Tickets por mes del cliente
router.get("/ticketsPorMesCliente/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const distribucion = await svc.obtenerTicketsPorMesCliente(id);
        res.status(200).json({ success: true, message: distribucion });
    } catch (error) {
        console.error('Error en controlador ticketsPorMesCliente:', error);
        res.status(500).json({ 
            success: false, 
            error: `Error al obtener tickets por mes: ${error.message}` 
        });
    }
});

router.post("/:id/calificar", async (req, res) => {
    const { id } = req.params;
    const { idUsuario, puntaje } = req.body;
    
    try {
        const resultado = await svc.agregarCalificacion(id, idUsuario, puntaje);
        return res.status(200).json({ success: true, data: resultado });
    } catch (error) {
        return res.status(500).json({ 
            error: `Error al calificar el ticket: ${error.message}` 
        });
    }
});

router.get("/:id/verificarCalificacion", async (req, res) => {
    const { id } = req.params;
    try {
        const yaCalificado = await svc.verificarTicketCalificado(id);
        return res.status(200).json({ success: true, yaCalificado });
    } catch (error) {
        return res.status(500).json({ 
            error: `Error al verificar calificación: ${error.message}` 
        });
    }
});

router.get("/estadisticas/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const estadisticas = await svc.obtenerEstadisticasTickets(id);
        return res.status(200).json({ success: true, message: estadisticas });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener estadísticas: ${e.message}` });
    }
});

router.get("/notificaciones/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const notificaciones = await svc.obtenerNotificaciones(id);
        return res.status(200).json({ success: true, message: notificaciones });
    } catch (e) {
        return res.status(500).send({ error: `Error al obtener notificaciones: ${e.message}` });
    }
});

router.put("/notificaciones/:id/leer", async (req, res) => {
    const { id } = req.params;
    try {
        await svc.marcarNotificacionComoLeida(id);
        return res.status(200).json({ success: true, message: 'Notificación marcada como leída' });
    } catch (e) {
        return res.status(500).json({ error: `Error al marcar notificación como leída: ${e.message}` });
    }
});

router.post("/:id/marcarNotificacionLeida", async (req, res) => {
    try {
        const { idNotificacion } = req.params;
        const service = new TicketService();
        await service.marcarNotificacionComoLeida(idNotificacion);
        res.json({ success: true, message: 'Notificación marcada como leída' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;