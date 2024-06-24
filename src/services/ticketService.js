const supabase = require('../configs/supabase');

const obtenerDatosDashboard = async (empleadoId) => {
    try {
        // Obtener los estados "abierto" y "cerrado"
        const { data: estados, error: estadosError } = await supabase
            .from('estado')
            .select('id, nombre')
            .in('nombre', ['abierto', 'cerrado']);

        if (estadosError) throw estadosError;

        const estadoAbierto = estados.find(estado => estado.nombre === 'abierto');
        const estadoCerrado = estados.find(estado => estado.nombre === 'cerrado');

        if (!estadoAbierto || !estadoCerrado) {
            throw new Error('No se encontraron los estados "abierto" o "cerrado" en la base de datos.');
        }

        // Obtener todos los tickets del empleado
        const { data: tickets, error: ticketsError } = await supabase
            .from('ticket')
            .select('*')
            .eq('fkusuario', empleadoId); // Filtrar por el ID del empleado

        if (ticketsError) throw ticketsError;

        // Obtener todas las prioridades
        const { data: prioridades, error: prioridadesError } = await supabase
            .from('prioridad')
            .select('id, caducidad');

        if (prioridadesError) throw prioridadesError;

        // Contar tickets asignados
        const ticketsAsignados = tickets.length;

        // Contar tickets sin resolver (estado "abierto")
        const ticketsSinResolver = tickets.filter(ticket => ticket.fkestado === estadoAbierto.id).length;

        // Contar tickets resueltos (estado "cerrado")
        const ticketsResueltos = tickets.filter(ticket => ticket.fkestado === estadoCerrado.id).length;

        // Calcular la fecha de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Obtener los tickets que vencen hoy
        const ticketsQueVencenHoy = tickets.filter(ticket => {
            const prioridad = prioridades.find(p => p.id === ticket.fkprioridad);
            if (!prioridad) return false;

            const fechaCreacion = new Date(ticket.fechacreacion);
            const fechaVencimiento = new Date(fechaCreacion);
            fechaVencimiento.setDate(fechaCreacion.getDate() + prioridad.caducidad);

            return fechaVencimiento.getTime() === hoy.getTime();
        });

        return {
            ticketsAsignados,
            ticketsSinResolver,
            ticketsResueltos,
            ticketsQueVencenHoy: ticketsQueVencenHoy.length,
        };
    } catch (error) {
        console.error('Error en obtenerDatosDashboard:', error.message);
        throw new Error('Hubo un error al obtener los datos del dashboard.');
    }
};

module.exports = {
    obtenerDatosDashboard,
};
