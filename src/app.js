var express = require("express");
var server = express();
var bodyParser = require("body-parser");

var model = {
    clients: {
        //javier:[{date: '11/11/2020', status:'pending'},{...}]

        //pepe : [{date, status}, {date, status}, {date, status}]
    },

    reset: function() {
        this.clients = {};
    },

    //model.clients={ juan: ,}
 /* model={ clients: {
                juan : [{date: xx/xx/xx YY:YY,status: xyz }],
                javier: [{date: xx/xx/xx YY:YY,status: xyz }]  
            }
        };
*/
    //model.addAppointment('juan', {date:'22/10/2020 12:00'});
    
    addAppointment: function(name,date){ //{date: 'fecha'}
        // si this.client.name NO existe, se crea un array vacio 
        // y le agregamos la info
        //si this.client.name SI existe, se agrega la info directamente            
        if(!this.clients[name]){
            this.clients[name] = []; //aca se crea el client
            this.clients[name].push(date);
            //agrego al obj date una prop status
            date.status = 'pending'; //{date:'fecha', status:'pending'}
        } else {
            this.clients[name].push(date);
            //agrego al obj date una prop status
            date.status = 'pending';
        }
        //console.log(this.clients)
    },

    attend: function(name, date){ //date es unico(es como un id)
        //cuando llaman a attend() para cambiar el status de una date, necesitamos buscar esa date
        let encontrado = this.clients[name].find( e => e.date === date) //referencia=>{date: status:}
        encontrado.status = 'attended';
    },
    
    expire: function(name, date){
        let encontrado = this.clients[name].find( e => e.date === date) //referencia=>{date: status:}
        encontrado.status = 'expired';
    },
    
    cancel: function(name, date){
        let encontrado = this.clients[name].find( e => e.date === date) //referencia=>{date: status:}
        encontrado.status = 'cancelled';
        
    }, 

    erase: function(name, value) { //value puede ser o date o status.
        // si te envian name con date vacia, borras todos los appointments de ese name
        let filtrados = this.clients[name].filter(e => e.date !== value && e.status !== value) // a || b  a && b 
        //le asignamos la referencia del filtrado al client
        this.clients[name] = filtrados;
    
    },

    getAppointments: function(name, status) {
        if(!status) {
            return this.clients[name]
        } else {
            let resultado = this.clients[name].filter(e => e.status === status);
            return resultado;
        }    
    },
    getClients: function() {
        //for (let key in this.clients){....} === Object.keys(this.clients)
        let clientsNames = Object.keys(this.clients) //retorna un array ['juan', 'javier',...]
        return clientsNames;
    }

};


server.use(bodyParser.json());

//SERVER:

//params ->| params llega url /:id   req.params.algo
//query -->| llega por url /?name=algo&lastname=otroalgo&ultimoName=ultimoAlgo  req.query.name ->algo   req.query.lastname  ->otroAlgo  
//body  -->| post/put/delete      req.body.algo     res.body  get  res.body


server.get('/api', function(req, res) {
    //retorno el obj con todos los clientes
    return res.json(model.clients)
});

server.post('/api/Appointments', function(req, res) {
    //recibo client y appoint por body(los capturo)-> el test te pide client y appointment
    let { client, appointment } = req.body;
    //si el client no existe, devuelvo error
    if(!client) {
        return res.status(400).send("the body must have a client property");
    } else if(typeof client !== "string") {
        return res.status(400).send("client must be a string");
    } else { //agrego un appointment al model
        model.addAppointment(client, appointment);
        //responds the appointment after the addition
        let searched = model.clients[client].find(e => e.date === appointment.date)
        return res.json(searched);
    }
});

//va aca por la manera en que express lee el archivo con sus rutas(si iba ultimo como en los test no pasa)
server.get("/api/Appointments/clients", function(req, res){
   return res.send(model.getClients());
});

server.get("/api/Appointments/:name", function(req,res){ //?date=xxx&option=xxx
    let { date, option } = req.query;
    let { name } = req.params;
    
    //si no esta el cliente que buscamos con el name que nos llega por params
    if(!model.clients[name]) {
        return res.status(400).send("the client does not exist");
    }
    //busco el cliente por date
    let searched = model.clients[name].find(e => e.date === date)
    if(!searched) {
        return res.status(400).send("the client does not have a appointment for that date")
    }
    //option debe ser attend, expire or cancel(que son metodos de)
    if (option === "attend" || option === "expire" || option === "cancel") {
        model[option](name, date)
        return res.send(searched)
    } else {
        return res.status(400).send("the option must be attend, expire or cancel")
    }    
});

server.get("/api/Appointments/:name/erase", function(req, res) { //?date=22/10/2020%2014:00
    let { name } = req.params;
    let { date } = req.query;

    if(!model.clients[name]) {
        return res.status(400).send("the client does not exist");
    } else {
        let deleted = model.clients[name].filter(e => e.date === date || e.status === date)
        model.erase(name, date);
        return res.send(deleted);
    }
});

server.get("/api/Appointments/getAppointments/:name", function(req, res) {
   let { name } = req.params;
   let { status } = req.query;
   //llamamos al getAppointments con el params y el query recibido 
   return res.send(model.getAppointments(name, status))
});

server.listen(3000);
module.exports = { model, server };
