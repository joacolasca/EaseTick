const TicketRepository = require('../repositories/ticketRepositories');

class TicketService {
    obtenerTicketsDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerTicketsSinResolverDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsSinResolverDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerTicketsResueltosDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsResueltosDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerTicketsVencenHoyDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const tickets = await repo.obtenerTicketsVencenHoyDeEmpleado(id);
            return tickets;
        } catch (error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerFeedbackDeEmpleado = async(id) => {
        try{
            const repo = new TicketRepository();
            const tickets = await repo.obtenerFeedbackDeEmpleado(id);
            return tickets;
        }
        catch(error) {
            throw new Error(`Error al obtener tickets del empleado: ${error.message}`);
        }
    }
    obtenerPorcentajeTicketsResueltos = async(id) => {
        try{
            const repo = new TicketRepository();
            const tickets = await repo.obtenerPorcentajeTicketsResueltos(id);
            return tickets;
        }
        catch(error) {
            throw new Error(`Error al obtener porcentaje de los tickets: ${error.message}`);
        }
    }
    obtenerDetalleDeTicketDeEmpleado = async (id) => {
        try {
            const repo = new TicketRepository();
            const ticketDetail = await repo.obtenerDetalleDeTicketDeEmpleado(id);
            return ticketDetail;
        } catch (error) {
            throw new Error(`Error al obtener detalle del ticket del empleado: ${error.message}`);
        }
    }
    async obtenerTicketsPorDiaDeLaSemana(id) {
        try {
            const repo = new TicketRepository();
            const ticketsPorDia = await repo.obtenerTicketsPorDiaDeLaSemana(id);
            return ticketsPorDia;
        } catch (error) {
            throw new Error(`Error al obtener tickets por día de la semana: ${error.message}`);
        }
    }
    async obtenerTicketsResueltosPorDiaDeLaSemana(id) {
        try {
            const repo = new TicketRepository();
            const ticketsPorDia = await repo.obtenerTicketsResueltosPorDiaDeLaSemana(id);
            return ticketsPorDia;
        } catch (error) {
            throw new Error(`Error al obtener tickets resueltos por día de la semana: ${error.message}`);
        }
    }
    async obtenerCantidadTicketsPorPrioridad(id) {
        try {
            const repo = new TicketRepository();
            const cantidadTicketsPorPrioridad = await repo.obtenerCantidadTicketsPorPrioridad(id);
            return cantidadTicketsPorPrioridad;
        } catch (error) {
            throw new Error(`Error al obtener la cantidad de tickets por prioridad: ${error.message}`);
        }
    }
    async obtenerPorcentajeTicketsPorEstado(id) {
        try {
            const repo = new TicketRepository();
            const porcentajeTicketsPorEstado = await repo.obtenerPorcentajeTicketsPorEstado(id);
            return porcentajeTicketsPorEstado;
        } catch (error) {
            throw new Error(`Error al obtener el porcentaje de tickets por estado: ${error.message}`);
        }
    }
    async obtenerCantidadTicketsPorTipo(id) {
        try {
            const repo = new TicketRepository();
            const cantidadTicketsPorTipo = await repo.obtenerCantidadTicketsPorTipo(id);
            return cantidadTicketsPorTipo;
        } catch (error) {
            throw new Error(`Error al obtener la cantidad de tickets por tipo: ${error.message}`);
        }
    }
    async obtenerCalificacionesPorUsuario(id) {
        try {
            const repo = new TicketRepository();
            const calificacionesPorUsuario = await repo.obtenerCalificacionesPorUsuario(id);
            return calificacionesPorUsuario;
        } catch (error) {
            throw new Error(`Hubo un error al obtener la cantidad de calificaciones por usuario: ${error.message}`);
        }
    }
    async agregarRecordatorio(texto, fkusuario) {
        try {
            const repo = new TicketRepository();
            const resultado = await repo.agregarRecordatorio(texto, fkusuario);
            return resultado;
        } catch (error) {
            throw new Error(`Error al agregar recordatorio: ${error.message}`);
        }
    }


    // Obtener los recordatorios de un usuario
    obtenerRecordatorios = async (fkusuario) => {
        try {
            const repo = new TicketRepository();
            const recordatorios = await repo.obtenerRecordatorios(fkusuario);
            return recordatorios;
        } catch (error) {
            throw new Error(`Error al obtener recordatorios: ${error.message}`);
        }
    }

    // Eliminar un recordatorio
    eliminarRecordatorio = async (id) => {
        try {
            const repo = new TicketRepository();
            const resultado = await repo.eliminarRecordatorio(id);
            return resultado;
        } catch (error) {
            throw new Error(`Error al eliminar recordatorio: ${error.message}`);
        }
    }
    obtenerEmpresasClientesPorUsuario = async (idUsuario) => {
        try {
            const repo = new TicketRepository();
            const empresas = await repo.obtenerEmpresasClientesPorUsuario(idUsuario);
            return empresas;
        } catch (error) {
            throw new Error(`Error al obtener las empresas clientes del usuario: ${error.message}`);
        }
    }
    obtenerEmpleadosYTicketsPorUsuario = async (idUsuario) => {
        try {
            const repo = new TicketRepository();
            const empleados = await repo.obtenerEmpleadosYTicketsPorUsuario(idUsuario);
            return empleados;
        } catch (error) {
            throw new Error(`Error al obtener los empleados y sus tickets: ${error.message}`);
        }
    }
    async obtenerMensajesDeTicket(idTicket) {
        try {
            const repo = new TicketRepository();
            const mensajes = await repo.obtenerMensajesDeTicket(idTicket);
            return mensajes;
        } catch (error) {
            throw new Error(`Error al obtener mensajes del ticket: ${error.message}`);
        }
    }

    

    }

module.exports = TicketService;