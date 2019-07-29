const { io } = require('../server');

const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');
const usuarios = new Usuarios();

io.on('connection', (client) => {
    client.on('entrarChat', (data, callback) => {

        if (!data.nombre || !data.sala) {
            return {
                error: true,
                mensaje: 'El nombre/sala es necesario'
            };
        }
        //crear sala
        client.join(data.sala);
        usuarios.agregarPersona(client.id, data.nombre,data.sala);

        client.broadcast.to(data.sala).emit('listaPersona',usuarios.getPersonaPorSala(data.sala))
        client.broadcast.to(data.sala).emit('crearMensaje',crearMensaje('Administrador',`${data.nombre} entro a la sala`))
        callback(usuarios.getPersonaPorSala(data.sala));
    })

    client.on('crearMensaje', (data,callback) =>{
        let persona = usuarios.getPersona(client.id)
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje',mensaje)
        
        callback(mensaje);
    })

    client.on('disconnect',()=>{
        let personaBorrada= usuarios.borrarPersona(client.id)
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Administrador',`${personaBorrada.nombre} salio de la sala`))
        client.broadcast.to(personaBorrada.sala).emit('listaPersona',usuarios.getPersonaPorSala(personaBorrada.sala))
    })

    //Mensaje privado
    client.on('mensajePrivado',(data) =>{
            let persana = usuarios.getPersona(client.id);
            client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persana.nombre,data.mensaje));
    })


});