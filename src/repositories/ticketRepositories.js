const ticketService = require('../services/ticketService');
const supabase = require('../configs/supabase');
class TicketRepository {
    obtenerTicketsDeEmpleado = async (id) => {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id);

            if (error) {
                throw new Error(error.message);
            }
            return data;
        } catch (error) {
            console.error(`Error en obtenerTicketsDeEmpleado: ${error.message}`);
            throw error;
        }
    }

    async obtenerTicketsSinResolverDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*, prioridad:prioridad(nombre)')
                .eq('fkusuario', id)
                .eq('fkestado', 1);

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error(`Error en obtenerTicketsSinResolverDeEmpleado: ${error.message}`);
            throw error;
        }
    }

    async obtenerTicketsResueltosDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id)
                .eq('fkestado', 2);

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error(`Error en obtener Tickets Resueltos De Empleado: ${error.message}`);
            throw error;
        }
    }

     
    async obtenerTicketsVencenHoyDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id)
                .in('fkprioridad', (await supabase.from('prioridad').select('id').eq('caducidad', new Date().toISOString().split('T')[0])).data.map(row => row.id))
            
            if (error) {
                throw new Error(error.message);
            }
    
            return data;
        } catch (error) {
            console.error(`Hubo un error al obtener los tickets que vencen hoy: ${error.message}`);
            throw error;
        }
    }
    async obtenerFeedbackDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('calificacion')
                .select('puntaje')
                .eq('fkusuario', id);
    
            if (error) {
                throw new Error(error.message);
            }
    
            const totalResenas = data.length;
            let positivo = 0;
            let neutral = 0;
            let negativo = 0;
    
            data.forEach(item => {
                if (item.puntaje == 1 || item.puntaje == 2) {
                    negativo++;
                } else if (item.puntaje == 3) {
                    neutral++;
                } else if (item.puntaje == 4 || item.puntaje == 5) {
                    positivo++;
                }
            });
    
            const porcentajePositivo = Math.round((positivo / totalResenas) * 100);
            const porcentajeNeutral = Math.round((neutral / totalResenas) * 100);
            const porcentajeNegativo = Math.round((negativo / totalResenas) * 100);
    
            return {
                total: totalResenas,
                positivo: porcentajePositivo,
                neutral: porcentajeNeutral,
                negativo: porcentajeNegativo
            };
        } catch (error) {
            console.error(`Hubo un error al obtener el feedback del empleado: ${error.message}`);
            throw error;
        }
    }
    async obtenerPorcentajeTicketsResueltos(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('fechafinalizado')
                .eq('fkusuario', id)
             if (error) {
                throw new Error(error.message);
            }
            const TotalTickets = data.length
            let ticketsResueltos = 0;
            let ticketsNoResueltos = 0;
            data.forEach(item => {
                if (item.fechafinalizado != null) ticketsResueltos++;
                else ticketsNoResueltos++;
            });
            const NoResueltos = Math.round((ticketsNoResueltos / TotalTickets) * 100);
            const Resueltos = Math.round((ticketsResueltos / TotalTickets) * 100);
            return{
                Tickets: TotalTickets,
                NoRealizados: NoResueltos,
                Realizados: Resueltos
            }
        } catch (error) {
            console.error(`Hubo un error al obtener los tickets que vencen hoy: ${error.message}`);
            throw error;
        }
    }
    async obtenerDetalleDeTicketDeEmpleado(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select(`
                    id,
                    asunto,
                    fechacreacion,
                    fechafinalizado,
                    empresa:fkempresa(nombre),
                    estado:fkestado(nombre),
                    prioridad:fkprioridad(nombre),
                    usuario:fkusuario(nombre)
                `)
                .eq('fkusuario', id);
                
            if (error) {
                throw new Error(error.message);
            }
    
            return data;
        } catch (error) {
            console.error(`Error en obtenerDetalleDeTicketDeEmpleado: ${error.message}`);
            throw error;
        }
    }
    

    async obtenerTicketsPorDiaDeLaSemana(id) {
        try {
            const hoy = new Date();
            
            // Obtener el lunes de la semana actual
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay() + (hoy.getDay() === 0 ? -6 : 1));
            inicioSemana.setHours(0, 0, 0, 0);

            // Obtener el domingo de la semana actual
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            // Obtener todos los tickets de la semana
            const { data, error } = await supabase
                .from('ticket')
                .select('fechacreacion')
                .eq('fkusuario', id)
                .gte('fechacreacion', inicioSemana.toISOString())
                .lte('fechacreacion', finSemana.toISOString());

            if (error) throw new Error(error.message);

            // Inicializar contadores para cada día
            const ticketsPorDia = {
                'L': 0, 'M': 0, 'X': 0, 'J': 0, 'V': 0, 'S': 0, 'D': 0
            };

            // Mapeo de números de día a letras
            const mapaDias = {
                0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S'
            };

            // Contar tickets por día, ajustando la zona horaria
            data.forEach(ticket => {
                const fechaTicket = new Date(ticket.fechacreacion);
                // Ajustar la zona horaria
                fechaTicket.setHours(fechaTicket.getHours() + 3); // Ajuste para UTC-3 (Argentina)
                const diaNumero = fechaTicket.getDay();
                const diaLetra = mapaDias[diaNumero];
                ticketsPorDia[diaLetra]++;
            });

            return ticketsPorDia;
        } catch (error) {
            console.error('Error en obtenerTicketsPorDiaDeLaSemana:', error);
            throw error;
        }
    }
    

    async obtenerTicketsResueltosPorDiaDeLaSemana(id) {
        try {
            const hoy = new Date();
            const diaSemana = hoy.getDay();
    
            // Calcular la fecha del último domingo
            const ultimoDomingo = new Date(hoy);
            ultimoDomingo.setDate(hoy.getDate() - diaSemana);
    
            // Calcular la fecha del lunes anterior al último domingo
            const ultimoLunes = new Date(ultimoDomingo);
            ultimoLunes.setDate(ultimoDomingo.getDate() - 6);
    
            // Ajustar las horas para representar correctamente el rango de fechas
            ultimoLunes.setHours(0, 0, 0, 0);
            ultimoDomingo.setHours(23, 59, 59, 999);
    
            // Convertir las fechas al formato 'YYYY-MM-DD' que acepta PostgreSQL
            const fechaInicio = ultimoLunes.toISOString().slice(0, 10);
            const fechaFin = ultimoDomingo.toISOString().slice(0, 10);
    
    
            // Ejecutar la consulta con las fechas en formato correcto
            const { data, error } = await supabase
                .from('ticket')
                .select('id, fechafinalizado')
                .eq('fkusuario', id)
                .not('fechafinalizado', 'is', null)
                .gte('fechafinalizado', fechaInicio)
                .lte('fechafinalizado', fechaFin);
    
            if (error) {
                throw new Error(error.message);
            }
    
            const diasSemana = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    
            const ticketsResueltosPorDia = {
                'D': 0, 'L': 0, 'M': 0, 'X': 0, 'J': 0, 'V': 0, 'S': 0
            };
    
            data.forEach(ticket => {
                const fechaTicket = new Date(ticket.fechafinalizado);
                // Mover la fecha del ticket un día adelante
                fechaTicket.setDate(fechaTicket.getDate() + 1);
                const diaSemanaResuelto = fechaTicket.getDay();
                const diaSemanaLetra = diasSemana[diaSemanaResuelto];
                ticketsResueltosPorDia[diaSemanaLetra]++;
            });
    
    
            return ticketsResueltosPorDia;
        } catch (error) {
            console.error(`Error en obtenerTicketsResueltosPorDiaDeLaSemana: ${error.message}`);
            throw error;
        }
    }
    
    async obtenerCantidadTicketsPorPrioridad(id) {
        try {
            // Consultar cantidad de tickets de prioridad Baja
            const { data: bajaData, error: bajaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 1); // Asumiendo que la prioridad Baja tiene el ID 1
    
            if (bajaError) {
                throw new Error(bajaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Media
            const { data: mediaData, error: mediaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 2); // Asumiendo que la prioridad Media tiene el ID 2
    
            if (mediaError) {
                throw new Error(mediaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Alta
            const { data: altaData, error: altaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 3); // Asumiendo que la prioridad Alta tiene el ID 3
    
            if (altaError) {
                throw new Error(altaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Urgente
            const { data: urgenteData, error: urgenteError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkprioridad', 4); // Asumiendo que la prioridad Urgente tiene el ID 4
    
            if (urgenteError) {
                throw new Error(urgenteError.message);
            }
    
            // Devolver el conteo de cada prioridad
            return {
                Baja: bajaData.length,
                Media: mediaData.length,
                Alta: altaData.length,
                Urgente: urgenteData.length
            };
        } catch (error) {
            console.error(`Error en obtenerCantidadTicketsPorPrioridad: ${error.message}`);
            throw error;
        }
    }
    
    
    async obtenerPorcentajeTicketsPorEstado(id) {
        try {
            // Obtener el total de tickets del empleado
            const { data: totalData, error: totalError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id);
    
            if (totalError) {
                throw new Error(totalError.message);
            }
    
            const totalTickets = totalData.length;
    
            // Verificar si el empleado tiene tickets
            if (totalTickets === 0) {
                return {
                    abiertos: 0,
                    cerrados: 0,
                    esperandoRespuesta: 0
                };
            }
    
            // Obtener cantidad de tickets en estado Abierto (ej. fkestado 1)
            const { data: abiertosData, error: abiertosError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkestado', 1); // Suponiendo que '1' es el estado Abierto
    
            if (abiertosError) {
                throw new Error(abiertosError.message);
            }
    
            // Obtener cantidad de tickets en estado Cerrado (ej. fkestado 2)
            const { data: cerradosData, error: cerradosError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkestado', 2); // Suponiendo que '2' es el estado Cerrado
    
            if (cerradosError) {
                throw new Error(cerradosError.message);
            }
    
            // Obtener cantidad de tickets en estado Esperando respuesta del cliente (ej. fkestado 3)
            const { data: esperandoData, error: esperandoError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fkestado', 3); // Suponiendo que '3' es el estado Esperando respuesta del cliente
    
            if (esperandoError) {
                throw new Error(esperandoError.message);
            }
    
            // Calcular porcentajes
            const porcentajeAbiertos = Math.round((abiertosData.length / totalTickets) * 100);
            const porcentajeCerrados = Math.round((cerradosData.length / totalTickets) * 100);
            const porcentajeEsperando = Math.round((esperandoData.length / totalTickets) * 100);
    
            return {
                abiertos: porcentajeAbiertos,
                cerrados: porcentajeCerrados,
                esperandoRespuesta: porcentajeEsperando
            };
        } catch (error) {
            console.error(`Error en obtenerPorcentajeTicketsPorEstado: ${error.message}`);
            throw error;
        }
    }
    async obtenerCantidadTicketsPorTipo(id) {
        
            // Consultar cantidad de tickets de prioridad Baja
            const { data: preguntaData, error: preguntaError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fktipo', 1); // Asumiendo que la prioridad Baja tiene el ID 1
    
            if (preguntaError) {
                throw new Error(preguntaError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Media
            const { data: incidenteData, error: incidenteError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fktipo', 2); // Asumiendo que la prioridad Media tiene el ID 2
    
            if (incidenteError) {
                throw new Error(incidenteError.message);
            }
            const { data: sugerenciaData, error: sugerenciaError } = await supabase
            .from('ticket')
            .select('id')
            .eq('fkusuario', id)
            .eq('fktipo', 3); // Asumiendo que la prioridad Urgente tiene el ID 4

        if (sugerenciaError) {
            throw new Error(sugerenciaError.message);
        }
            // Consultar cantidad de tickets de prioridad Alta
            const { data: mantenimientoData, error: mantenimientoError } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkusuario', id)
                .eq('fktipo', 4); // Asumiendo que la prioridad Alta tiene el ID 3
    
            if (mantenimientoError) {
                throw new Error(mantenimientoError.message);
            }
    
            // Consultar cantidad de tickets de prioridad Urgente
            
            try {
                const { data: reclamoData, error: reclamoError } = await supabase
                    .from('ticket')
                    .select('id')
                    .eq('fkusuario', id)
                    .eq('fktipo', 5); // Asumiendo que la prioridad Baja tiene el ID 1
        
                if (reclamoError) {
                    throw new Error(reclamoError.message);
                }
            // Devolver el conteo de cada prioridad
            return {
                Pregunta: preguntaData.length,
                Incidente: incidenteData.length,
                Sugerencia: sugerenciaData.length,
                Mantenimiento: mantenimientoData.length,
                Reclamo: reclamoData.length
            };
        } catch (error) {
            console.error(`Error en obtenerCantidadTicketsPorPrioridad: ${error.message}`);
            throw error;
        }
    }
async obtenerCalificacionesPorUsuario(id) {
    try {
        const { data, error } = await supabase
            .from('calificacion')
            .select('puntaje')
            .eq('fkusuario', id);

        if (error) {
            throw new Error(error.message);
        }

        let puntajeUno = 0;
        let puntajeDos = 0;
        let puntajeTres = 0;
        let puntajeCuatro = 0;
        let puntajeCinco = 0;

        data.forEach(item => {
            if (item.puntaje == 1) {
                puntajeUno++;
            } else if (item.puntaje == 2) {
                puntajeDos++;
            } else if (item.puntaje == 3) {
                puntajeTres++;
            } else if (item.puntaje == 4) {
                puntajeCuatro++;
            } else if (item.puntaje == 5) {
                puntajeCinco++;
            }
        });

        return {
            "1⭐": puntajeUno,
            "2⭐": puntajeDos,
            "3⭐": puntajeTres,
            "4⭐": puntajeCuatro,
            "5⭐": puntajeCinco,

        };
    } catch (error) {
        console.error(`Hubo un error al obtener la cantidad de calificaciones por usuario: ${error.message}`);
        throw error;
    }
}
async agregarRecordatorio(texto, idUsuario) {
    try {
        const { data: usuarioData, error: usuarioError } = await supabase
            .from('usuario')
            .select('*')
            .eq('id', idUsuario)
            .single();

        if (usuarioError) {
            throw new Error('Usuario no encontrado.');
        }

        const { data, error } = await supabase
            .from('recordatorio')
            .insert([{ texto: texto, fkusuario: idUsuario }])
            .select() // Agregamos .select() para obtener el registro insertado
            .single(); // Obtenemos solo el primer registro

        if (error) {
            throw new Error(error.message);
        }

        return { recordatorio: data, usuario: usuarioData };
    } catch (error) {
        console.error(`Error en agregarRecordatorio: ${error.message}`);
        throw error;
    }
}
async obtenerRecordatorios(fkusuario) {
    try {
        const { data, error } = await supabase
            .from('recordatorio')
            .select('*')
            .eq('fkusuario', fkusuario);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error al obtener recordatorios: ${error.message}`);
        throw error;
    }
}

// Eliminar un recordatorio
async eliminarRecordatorio(id) {
    try {
        const { data, error } = await supabase
            .from('recordatorio')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error al eliminar recordatorio: ${error.message}`);
        throw error;
    }
}
    obtenerEmpresasClientesPorUsuario = async (idUsuario) => {
        try {
            const { data: empresaUsuario, error: errorUsuario } = await supabase
                .from('usuario')
                .select('fkempresa')
                .eq('id', idUsuario)
                .single();  

            if (errorUsuario) {
                throw new Error(errorUsuario.message);
            }

            const fkEmpresa = empresaUsuario.fkempresa;

            const { data, error } = await supabase
                .from('empresaCliente')
                .select('fkCliente(id, nombre, tipo, correoelectronico)')
                .eq('fkEmpresa', fkEmpresa);

            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error(`Error en obtenerEmpresasClientesPorUsuario: ${error.message}`);
            throw error;
        }
    }
    obtenerEmpleadosYTicketsPorUsuario = async (idUsuario) => {
    try {
        const { data: empresaUsuario, error: errorUsuario } = await supabase
            .from('usuario')
            .select('fkempresa')
            .eq('id', idUsuario)
            .single();  

        if (errorUsuario) {
            throw new Error(errorUsuario.message);
        }

        const fkEmpresa = empresaUsuario.fkempresa;

        const { data, error } = await supabase
            .from('usuario')
            .select(`
                id, 
                nombre, 
                correoelectronico, 
                calificacion(puntaje), 
                ticket!ticket_fkusuario_fkey(id, asunto, fkestado)
            `)
            .eq('fkempresa', fkEmpresa);

        if (error) {
            throw new Error(error.message);
        }

        const empleados = data.reduce((acc, empleado) => {
            const totalTickets = empleado.ticket.length;
            const calificaciones = empleado.calificacion.map(c => c.puntaje);
            const promedioCalificacion = calificaciones.length > 0 ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length : 0;

            acc.push({
                id: empleado.id,
                nombre: empleado.nombre,
                email: empleado.correoelectronico,
                calificacion: `${Math.round(promedioCalificacion)}/5`,
                ticketsAsignados: totalTickets
            });

            return acc;
        }, []);

        return empleados;
    } catch (error) {
        console.error(`Error en obtenerEmpleadosYTicketsPorUsuario: ${error.message}`);
        throw error;
    }
}
crearTicket = async (asunto, mensaje, idCliente, idEmpresa, tipo, prioridad) => {
    try {
        // Convertir a números si vienen como strings
        const tipoNum = parseInt(tipo);
        const prioridadNum = parseInt(prioridad);
        const idClienteNum = parseInt(idCliente);
        const idEmpresaNum = parseInt(idEmpresa);

        // Validar que las conversiones sean exitosas
        if (isNaN(tipoNum) || isNaN(prioridadNum) || isNaN(idClienteNum) || isNaN(idEmpresaNum)) {
            throw new Error('Los valores numéricos son inválidos');
        }

        // Obtener todos los empleados
        const { data: empleados, error: empleadosError } = await supabase
            .from('usuario')
            .select('id')
            .in('fkrol', [2, 3])

        if (empleadosError) throw new Error(empleadosError.message);

        // Obtener conteo de tickets por empleado
        const { data: tickets, error: ticketsError } = await supabase
            .from('ticket')
            .select('fkusuario');

        if (ticketsError) throw new Error(ticketsError.message);

        // Contar tickets por empleado
        const ticketCounts = tickets.reduce((acc, ticket) => {
            acc[ticket.fkusuario] = (acc[ticket.fkusuario] || 0) + 1;
            return acc;
        }, {});

        // Encontrar el empleado con menos tickets
        const empleadoConMenosTickets = empleados.reduce((minEmpleado, empleado) => {
            const ticketCount = ticketCounts[empleado.id] || 0;
            return ticketCount < minEmpleado.count ? { id: empleado.id, count: ticketCount } : minEmpleado;
        }, { id: null, count: Infinity });

        // Crear el ticket
        const { data, error } = await supabase
            .from('ticket')
            .insert([
                { 
                    asunto,
                    fktipo: tipoNum,
                    fkestado: 1,
                    fkprioridad: prioridadNum,
                    fkusuario: empleadoConMenosTickets.id,
                    fkempresa: idEmpresaNum,
                    fkcliente: idClienteNum,
                    fechacreacion: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw new Error(error.message);

        // Insertar el mensaje inicial (ahora solo con fkCliente)
        const { data: mensajeData, error: mensajeError } = await supabase
            .from('mensaje')
            .insert([
                {
                    fkticket: data.id,
                    fkCliente: idClienteNum,
                    contenido: mensaje,
                    fechacreacion: new Date().toISOString(),
                    fkEmpleado: null // Ya no asignamos el empleado al mensaje inicial
                }
            ])
            .select();

        if (mensajeError) throw new Error(mensajeError.message);

        // Crear notificación para el empleado asignado
        const fechaActual = new Date();
        fechaActual.setHours(0, 0, 0, 0);

        const { error: notificacionError } = await supabase
            .from('notificacion')
            .insert([{
                fkusuario: empleadoConMenosTickets.id,
                tipo: 'nuevo_ticket',
                contenido: `Se te ha asignado un nuevo ticket: ${asunto}`,
                fkticket: data.id,
                fechacreacion: fechaActual.toISOString(),
                leido: false
            }]);

        if (notificacionError) throw new Error(notificacionError.message);

        return { ticket: data, mensaje: mensajeData[0] };
    } catch (error) {
        console.error(`Error en crearTicket: ${error.message}`);
        throw error;
    }
}


responderTicket = async (idTicket, mensaje,idUsuario, esEmpleado) => {
    try {
        if (!idTicket) {
            throw new Error("idTicket es requerido");
        }

        const { data: ticketData, error: ticketError } = await supabase
            .from('ticket')
            .select('*')
            .eq('id', idTicket)
            .single();

        if (ticketError) throw new Error(`Ticket no encontrado: ${ticketError.message}`);

        const { data, error } = await supabase
            .from('mensaje')
            .insert([
                {
                    fkticket: idTicket,
                    fkCliente: null,
                    contenido: mensaje,
                    fechacreacion: new Date().toISOString(),
                    fkEmpleado: esEmpleado 
                }
            ])
            .select();
        if (error) throw new Error(`Error al insertar mensaje: ${error.message}`);

        const nuevoEstado = esEmpleado ? 1 : 3; 
        const { error: updateError } = await supabase
            .from('ticket')
            .update({ fkestado: nuevoEstado })
            .eq('id', idTicket);

        if (updateError) throw new Error(`Error al actualizar el estado del ticket: ${updateError.message}`);

        return { mensaje: data, ticket: ticketData };
    } catch (error) {
        console.error(`Error en responderTicket: ${error.message}`);
        throw error;
    }
}
  async obtenerMensajesDeTicket(idTicket) {
    try {
        const { data, error } = await supabase
            .from('mensaje')
            .select(`
                *,
                fkCliente:fkCliente(nombre),
                fkEmpleado:fkEmpleado(nombre)
            `)
            .eq('fkticket', idTicket)
            .order('fechacreacion', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    } catch (error) {
        console.error('Error en obtenerMensajesDeTicket:', error);
        throw error;
    }
}

async enviarMensaje(idTicket, userId, contenido, isEmployee, archivo) {
    try {
        let archivoUrl = null;
        let archivoNombre = null;

        if (archivo) {
            console.log('Intentando subir archivo a Supabase Storage');
            
            const uploadPath = `ticket-${idTicket}/${Date.now()}-${archivo.originalname}`;
            console.log('Ruta de subida:', uploadPath);

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('chat-archivos')
                .upload(uploadPath, archivo.buffer, {
                    contentType: archivo.mimetype,
                    cacheControl: '3600'
                });

            if (uploadError) {
                console.error('Error al subir archivo:', uploadError);
                throw uploadError;
            }

            console.log('Archivo subido exitosamente:', uploadData);

            const { data: urlData } = await supabase.storage
                .from('chat-archivos')
                .getPublicUrl(uploadPath);

            archivoUrl = urlData.publicURL;
            archivoNombre = archivo.originalname;

            console.log('URL pública generada:', archivoUrl);
        }

        // Crear mensaje
        const { data: mensaje, error } = await supabase
            .from('mensaje')
            .insert([{
                fkticket: idTicket,
                contenido: contenido || '',
                fkCliente: !isEmployee ? userId : null,
                fkEmpleado: isEmployee ? userId : null,
                archivo_url: archivoUrl,
                archivo_nombre: archivoNombre,
                fechacreacion: new Date().toISOString()
            }])
            .select('*, fkEmpleado(*), fkCliente(*)')
            .single();

        if (error) {
            console.error('Error al insertar mensaje:', error);
            throw error;
        }

        console.log('Mensaje insertado:', mensaje);
        return mensaje;
    } catch (error) {
        console.error('Error en enviarMensaje:', error);
        throw error;
    }
}

async cerrarTicket(idTicket) {
    try {
        const fechaActual = new Date().toISOString();
        const { data: ticket, error } = await supabase
            .from('ticket')
            .update({ 
                fkestado: 2,  // Estado "Cerrado"
                fechafinalizado: fechaActual 
            })
            .eq('id', idTicket)
            .select()
            .single();

        if (error) throw error;

        return ticket;
    } catch (error) {
        console.error('Error en repositorio cerrarTicket:', error);
        throw error;
    }
}

async obtenerTicket(id) {
    try {
        const { data, error } = await supabase
            .from('ticket')
            .select(`
                *,
                prioridad:prioridad(id, nombre),
                tipo:tipoticket(id, nombre)
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Repositorio: Error de Supabase al obtener ticket ${id}:`, error);
            throw new Error(error.message);
        }
        if (!data) {
            throw new Error("Ticket no encontrado");
        }

        // Asegurarse de que prioridad y tipo tengan un valor por defecto si son null
        data.prioridad = data.prioridad || { id: null, nombre: 'No especificada' };
        data.tipo = data.tipo || { id: null, nombre: 'No especificado' };

        return data;
    } catch (error) {
        console.error(`Repositorio: Error al obtener ticket ${id}:`, error);
        throw error;
    }
}
async obtenerInformacionCompletaDeTicket(id) {
    try {
        const { data, error } = await supabase
            .from('ticket')
            .select(`
                *,
                prioridad:prioridad(id, nombre),
                tipo:tipoticket(id, nombre),
                mensajes:mensaje(*, fkCliente(nombre), fkEmpleado(nombre))
            `)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    } catch (error) {
        console.error(`Error al obtener información completa del ticket: ${error.message}`);
        throw error;
    }
}
    obtenerTicketsDeCliente = async (id) => {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select(`
                    *,
                    prioridad:prioridad(nombre),
                    estado:fkestado(nombre),
                    tipo:tipoticket(nombre),
                    usuario:fkusuario(nombre)
                `)
                .eq('fkcliente', id)
                .order('fechacreacion', { ascending: false });

            if (error) {
                throw new Error(error.message);
            }
            return data;
        } catch (error) {
            console.error(`Error en obtenerTicketsDeCliente: ${error.message}`);
            throw error;
        }
    }
    obtenerEquipoCliente = async (idCliente) => {
        try {
            // Primero, obtenemos la empresa del cliente
            const { data: cliente, error: clienteError } = await supabase
                .from('usuario')
                .select('fkempresa')
                .eq('id', idCliente)
                .single();

            if (clienteError) throw new Error(clienteError.message);

            // Luego, obtenemos todos los usuarios de esa empresa
            const { data: equipo, error: equipoError } = await supabase
                .from('usuario')
                .select('id, nombre, correoelectronico')
                .eq('fkempresa', cliente.fkempresa);

            if (equipoError) throw new Error(equipoError.message);

            return equipo;
        } catch (error) {
            console.error(`Error en obtenerEquipoCliente: ${error.message}`);
            throw error;
        }
    }

    async obtenerTotalTicketsCliente(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('id')
                .eq('fkcliente', id);

            if (error) throw new Error(error.message);
            return data.length;
        } catch (error) {
            throw new Error(`Error en obtenerTotalTicketsCliente: ${error.message}`);
        }
    }

    async obtenerTicketsPorEstadoCliente(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('estado:fkestado(nombre)')
                .eq('fkcliente', id);

            if (error) throw new Error(error.message);

            const distribucion = data.reduce((acc, ticket) => {
                const estado = ticket.estado.nombre;
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {});

            return distribucion;
        } catch (error) {
            throw new Error(`Error en obtenerTicketsPorEstadoCliente: ${error.message}`);
        }
    }

    async obtenerTicketsPorPrioridadCliente(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('prioridad:fkprioridad(nombre)')
                .eq('fkcliente', id);

            if (error) throw new Error(error.message);

            const distribucion = data.reduce((acc, ticket) => {
                const prioridad = ticket.prioridad.nombre;
                acc[prioridad] = (acc[prioridad] || 0) + 1;
                return acc;
            }, {});

            return distribucion;
        } catch (error) {
            throw new Error(`Error en obtenerTicketsPorPrioridadCliente: ${error.message}`);
        }
    }

    async obtenerTiempoPromedioResolucionCliente(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('fechacreacion, fechafinalizado')
                .eq('fkcliente', id)
                .not('fechafinalizado', 'is', null);

            if (error) throw new Error(error.message);

            if (data.length === 0) return 0;

            const tiempoTotal = data.reduce((acc, ticket) => {
                const inicio = new Date(ticket.fechacreacion);
                const fin = new Date(ticket.fechafinalizado);
                return acc + (fin - inicio);
            }, 0);

            return Math.round(tiempoTotal / (data.length * 3600000)); // Convertir a horas
        } catch (error) {
            throw new Error(`Error en obtenerTiempoPromedioResolucionCliente: ${error.message}`);
        }
    }

    async obtenerTicketsPorTipoCliente(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('tipo:tipoticket(nombre)')
                .eq('fkcliente', id);

            if (error) throw new Error(error.message);

            const distribucion = data.reduce((acc, ticket) => {
                const tipo = ticket.tipo.nombre;
                acc[tipo] = (acc[tipo] || 0) + 1;
                return acc;
            }, {});

            return distribucion;
        } catch (error) {
            throw new Error(`Error en obtenerTicketsPorTipoCliente: ${error.message}`);
        }
    }

    async obtenerTendenciaSemanalCliente(id) {
        try {
            const hoy = new Date();
            const diaSemana = hoy.getDay();

            // Calcular el inicio de la semana (lunes)
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1));
            inicioSemana.setHours(0, 0, 0, 0);

            // Calcular el fin de la semana (domingo)
            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from('ticket')
                .select('fechacreacion')
                .eq('fkcliente', id)
                .gte('fechacreacion', inicioSemana.toISOString())
                .lte('fechacreacion', finSemana.toISOString())
                .order('fechacreacion');

            if (error) throw new Error(error.message);

            // Inicializar array para los días de la semana
            const ticketsPorDia = [0, 0, 0, 0, 0, 0, 0]; // L,M,X,J,V,S,D

            // Contar tickets por día
            data.forEach(ticket => {
                const fechaTicket = new Date(ticket.fechacreacion);
                fechaTicket.setHours(fechaTicket.getHours() + 24);
                const dia = fechaTicket.getDay();
                // Convertir el índice del día (0-6) al índice del array (0-6 pero empezando en lunes)
                const indiceArray = dia === 0 ? 6 : dia - 1;
                ticketsPorDia[indiceArray]++;
            });

            return ticketsPorDia;
        } catch (error) {
            console.error('Error en obtenerTendenciaSemanalCliente:', error);
            throw error;
        }
    }

    async obtenerTicketsPorMesCliente(id) {
        try {
            // Obtener fecha actual y fecha de hace 6 meses
            const fechaActual = new Date();
            const fecha6MesesAtras = new Date();
            fecha6MesesAtras.setMonth(fechaActual.getMonth() - 5); // -5 para incluir el mes actual
            fecha6MesesAtras.setDate(1); // Primer día del mes

            const { data, error } = await supabase
                .from('ticket')
                .select('fechacreacion')
                .eq('fkcliente', id)
                .gte('fechacreacion', fecha6MesesAtras.toISOString())
                .order('fechacreacion');

            if (error) throw new Error(error.message);

            // Crear array con los últimos 6 meses en orden
            const mesesOrdenados = {};
            for (let i = 5; i >= 0; i--) {
                const fecha = new Date();
                fecha.setMonth(fechaActual.getMonth() - i);
                const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
                const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
                mesesOrdenados[mesCapitalizado] = 0;
            }

            // Contar tickets por mes
            data.forEach(ticket => {
                const fecha = new Date(ticket.fechacreacion);
                const nombreMes = fecha.toLocaleString('es-ES', { month: 'long' });
                const mesCapitalizado = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
                if (mesesOrdenados.hasOwnProperty(mesCapitalizado)) {
                    mesesOrdenados[mesCapitalizado]++;
                }
            });

            return mesesOrdenados;
        } catch (error) {
            throw new Error(`Error en obtenerTicketsPorMesCliente: ${error.message}`);
        }
    }

    async agregarCalificacion(idTicket, idUsuario, puntaje) {
        try {
            // Obtener el empleado asociado al ticket
            const { data: ticket, error: ticketError } = await supabase
                .from('ticket')
                .select('fkusuario')
                .eq('id', idTicket)
                .single();

            if (ticketError) throw new Error(ticketError.message);

            // Verificar que el usuario sea un cliente (fkrol = 1)
            const { data: usuario, error: usuarioError } = await supabase
                .from('usuario')
                .select('fkrol')
                .eq('id', idUsuario)
                .single();

            if (usuarioError) throw new Error(usuarioError.message);
            
            if (usuario.fkrol !== 1) {
                throw new Error('Solo los clientes pueden calificar tickets');
            }

            // Verificar si el ticket ya fue calificado
            const { data: existingRating, error: existingError } = await supabase
                .from('calificacion')
                .select('id')
                .eq('fkticket', idTicket);

            if (existingError) throw new Error(existingError.message);

            if (existingRating.length > 0) {
                throw new Error('Este ticket ya ha sido calificado');
            }

            // Insertar nueva calificación
            const { data, error } = await supabase
                .from('calificacion')
                .insert([{
                    puntaje: puntaje,
                    fkusuario: ticket.fkusuario,
                    fkticket: idTicket
                }])
                .select();

            if (error) throw new Error(error.message);
            return data[0];
        } catch (error) {
            console.error(`Error en agregarCalificacion: ${error.message}`);
            throw error;
        }
    }

    async verificarTicketCalificado(idTicket) {
        try {
            // Verificar si existe una calificación para este ticket específico
            const { data, error } = await supabase
                .from('calificacion')
                .select('id')
                .eq('fkticket', idTicket);

            if (error) throw new Error(error.message);

            return data.length > 0;
        } catch (error) {
            console.error(`Error en verificarTicketCalificado: ${error.message}`);
            throw error;
        }
    }

    async crearMensaje(idTicket, userId, contenido, isEmployee, archivo) {
        try {
            let archivoUrl = null;
            let archivoNombre = null;

            if (archivo) {
                console.log('Intentando subir archivo a Supabase Storage');
                
                const uploadPath = `ticket-${idTicket}/${Date.now()}-${archivo.originalname}`;
                console.log('Ruta de subida:', uploadPath);

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('archivos-mensajes')
                    .upload(uploadPath, archivo.buffer, {
                        contentType: archivo.mimetype
                    });

                if (uploadError) {
                    console.error('Error al subir archivo:', uploadError);
                    throw uploadError;
                }

                console.log('Archivo subido exitosamente:', uploadData);

                const { data: { publicUrl } } = supabase.storage
                    .from('archivos-mensajes')
                    .getPublicUrl(uploadData.path);

                console.log('URL pública generada:', publicUrl);

                archivoUrl = publicUrl;
                archivoNombre = archivo.originalname;
            }

            // Crear el mensaje en la base de datos
            const { data, error } = await supabase
                .from('mensaje')
                .insert([{
                    fkticket: idTicket,
                    contenido: contenido,
                    fkCliente: !isEmployee ? userId : null,
                    fkEmpleado: isEmployee ? userId : null,
                    archivo_url: archivoUrl,
                    archivo_nombre: archivoNombre,
                    fechacreacion: new Date().toISOString()
                }])
                .select('*, fkEmpleado(*), fkCliente(*)');

            if (error) throw error;
            return data[0];
        } catch (error) {
            console.error('Error detallado en crearMensaje:', error);
            throw error;
        }
    }

    async obtenerMensajeConDetalles(mensajeId) {
        const { data, error } = await supabase
            .from('mensaje')
            .select(`
                *,
                fkEmpleado (
                    id,
                    nombre
                ),
                fkCliente (
                    id,
                    nombre
                )
            `)
            .eq('id', mensajeId)
            .single();

        if (error) throw error;
        return data;
    }

    async obtenerEstadisticasTickets(id) {
        try {
            // Obtener todos los tickets del usuario
            const { data: tickets, error } = await supabase
                .from('ticket')
                .select(`
                    *,
                    prioridad:fkprioridad(nombre)
                `)
                .eq('fkusuario', id);

            if (error) throw new Error(error.message);

            // Calcular estadísticas
            const totalTickets = tickets.length;
            const highPriority = tickets.filter(ticket => 
                ticket.prioridad?.nombre === 'Alta' || ticket.prioridad?.nombre === 'Urgente'
            ).length;
            const assignedTickets = tickets.filter(ticket => ticket.fkestado === 1).length; // Sin resolver
            const unassignedTickets = tickets.filter(ticket => ticket.fkestado === 2).length; // Resueltos

            return {
                totalTickets,
                highPriority,
                assignedTickets,
                unassignedTickets
            };
        } catch (error) {
            console.error('Error en obtenerEstadisticasTickets:', error);
            throw error;
        }
    }

    async crearNotificacion(idUsuario, tipo, contenido, idTicket) {
        try {
            const { data, error } = await supabase
                .from('notificacion')
                .insert([{
                    fkusuario: idUsuario,
                    tipo: tipo,
                    contenido: contenido,
                    fkticket: idTicket
                }])
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            throw new Error(`Error al crear notificación: ${error.message}`);
        }
    }

    async obtenerNotificacionesYRecordatorios(idUsuario) {
        try {
            // Obtener notificaciones
            const { data: notificaciones, error: notifError } = await supabase
                .from('notificacion')
                .select(`
                    *,
                    ticket:fkticket (
                        asunto,
                        id,
                        fechacreacion
                    )
                `)
                .eq('fkusuario', idUsuario)
                .eq('leido', false)
                .order('fechacreacion', { ascending: false });

            if (notifError) throw notifError;

            // Obtener recordatorios
            const { data: recordatorios, error: recError } = await supabase
                .from('recordatorio')
                .select('*')
                .eq('fkusuario', idUsuario)
                .order('id', { ascending: false });

            if (recError) throw recError;

            // Combinar y formatear los resultados
            const recordatoriosFormateados = recordatorios.map(rec => ({
                ...rec,
                tipo: 'recordatorio',
                contenido: rec.texto,
                leido: false,
                fechacreacion: rec.created_at || new Date().toISOString()
            }));

            const notificacionesFormateadas = notificaciones.map(notif => ({
                ...notif,
                tipo: 'notificacion'
            }));

            return [...notificacionesFormateadas, ...recordatoriosFormateados];
        } catch (error) {
            throw new Error(`Error al obtener notificaciones y recordatorios: ${error.message}`);
        }
    }

    async marcarNotificacionComoLeida(idNotificacion) {
        try {
            const { data, error } = await supabase
                .from('notificacion')
                .update({ leido: true })
                .eq('id', idNotificacion)
                .select();

            if (error) throw error;
            return data[0];
        } catch (error) {
            throw new Error(`Error al marcar notificación como leída: ${error.message}`);
        }
    }

    async obtenerTicketsEsperandoRespuesta(id) {
        try {
            const { data, error } = await supabase
                .from('ticket')
                .select('*')
                .eq('fkusuario', id)
                .eq('fkestado', 3); // Asumiendo que el estado 3 es "Esperando respuesta"
            
            if (error) {
                throw new Error(error.message);
            }

            return data;
        } catch (error) {
            console.error(`Error al obtener tickets esperando respuesta: ${error.message}`);
            throw error;
        }
    }
}




module.exports = TicketRepository;