const supabase = require('../configs/supabase');

const findUsuarioByCorreoElectronico = async (correoelectronico) => {
    const { data, error } = await supabase
        .from('usuario')
        .select(`
            *,
            empresa:fkempresa(
                id,
                nombre,
                correoelectronico,
                telefono
            ),
            rol:fkrol(
                id,
                nombre,
                descripcion
            )
        `)
        .eq('correoelectronico', correoelectronico)
        .single();

    if (error) {
        console.error('Error obteniendo usuario:', error);
        throw error;
    }

    return data;
};

const obtenerPerfilEmpleadoCompleto = async (id) => {
    try {
        const { data, error } = await supabase
            .from('usuario')
            .select(`
                id,
                nombre,
                correoelectronico,
                empresa:fkempresa (
                    id,
                    nombre
                ),
                rol:fkrol (
                    id,
                    nombre
                ),
                tickets_asignados:ticket!ticket_fkusuario_fkey (
                    count
                ).filter(fkestado.neq.2),
                tickets_resueltos:ticket!ticket_fkusuario_fkey (
                    count
                ).filter(fkestado.eq.2),
                calificacion (
                    puntaje
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        // Calcular el promedio de calificaciones
        const calificaciones = data.calificacion?.map(c => c.puntaje) || [];
        const promedio = calificaciones.length > 0 
            ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length 
            : 0;

        // Formatear la respuesta
        return {
            ...data,
            tickets_activos: data.tickets_asignados?.length || 0,
            tickets_resueltos: data.tickets_resueltos?.length || 0,
            calificacion_promedio: Number(promedio.toFixed(2))
        };
    } catch (error) {
        console.error('Error obteniendo perfil del empleado:', error);
        throw error;
    }
};

module.exports = {
    findUsuarioByCorreoElectronico,
    obtenerPerfilEmpleadoCompleto
};

