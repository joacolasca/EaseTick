const supabase = require('../configs/supabase');
class UserRepository {
    async obtenerPerfilUsuario(id) {
        try {
            const { data, error } = await supabase
                .from('usuario')
                .select(`
                    id,
                    nombre,
                    correoelectronico,
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
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error en obtenerPerfilUsuario:', error);
            throw error;
        }
    } 
}
module.exports = UserRepository;