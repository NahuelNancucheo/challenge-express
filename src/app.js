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

    attend: function(name, date){ //date es unico
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
        // let otroFiltro = this.clients[name].filter(e => e.date === value && e.status === value) 
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

server.get('/api', function(req, res) {
    //retorno el obj con todos los clientes
    res.json(model.clients)
});

//params ->| params llega url /:id   req.params.algo
//query -->| llega por url /?name=algo&lastname=otroalgo&ultimoName=ultimoAlgo  req.query.name ->algo   req.query.lastname  ->otroAlgo  
//body  -->| post/put/delete      req.body.algo     res.body  get  res.body




server.listen(3000);
module.exports = { model, server };
