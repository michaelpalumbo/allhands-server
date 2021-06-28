// note: this version is for running allhands server as a cloud instance on heroku, so to push updates, use:
// git push heroku main

// alternative to setInterval:
var heartbeats = require('heartbeats');

// create hashes from thisNode objects (i.e. unique ids easily generated for each connected client)
const hash = require('object-hash')
// a heart that beats every 1 second.
var heart = heartbeats.createHeart(1000);

let pings = {

}

let locations = {}

let clients = {}
const WebSocket = require('ws');


// run the serverconst WebSocket = require('ws');
const app = require('express')()
const http = require('http').createServer(app);;

let listenPort = (process.env.PORT || 8081)
const wss = new WebSocket.Server({ 'server': http, clientTracking: true });
http.listen(listenPort, function(){
})
wss.on('connection', function connection(ws, req, client) {
    let name = null
    console.log('new connection established ')

    // start the ping/pong for calculating round-trip timing
    // Alternative to setInterval
    heart.createEvent(1, function(count, last){
        let pingMsg = JSON.stringify({
            cmd: 'ping',
            data: Date.now()
        })
        ws.send(pingMsg)
    });

    ws.on('message', function incoming(message) {
        msg = JSON.parse(message)
        // console.log(msg)

        switch (msg.cmd){

            case "thisNode":
            case 'thisMachine':
                // first check if name is already in use
                if(locations.hasOwnProperty(msg.data.name) == false){
                    // if not in use, reserve their spot
                    let thisHash = hash(msg)
                    locations[thisHash] = msg.data
                    name = thisHash
                    console.log(locations)

                } else {
                    // if in use, send message to user to ask if they want to keep their current name (and collide with someone else), try a different name, or use a dap.

                    console.log('node name exists on network, prompting user')
                    console.log(locations)
                    let nameChange = JSON.stringify({
                        cmd: 'nameTaken',
                        name: msg.data.name
                    })
                    console.log(nameChange)
                    ws.send(nameChange)
                }

            break

            case 'doppelganger':
                //! mention this in the allhands paper: this was deliberate, it means that someone could join allhands, listen for incoming traffic and then rejoin from an already connected user to jam the network with uncertain data, like spoofing. I want this as an option, as there's nothing stopping someone from creating a dap connection. 
                // someone has chosen to join the network when their name already exists
                // therefore, need to add their name to the locations object
                let thisHash = hash(msg)
                locations[thisHash] = msg.data
                name = thisHash
                console.log(locations)
            break

            case 'thisMachine':
                locations[msg.name] = {}
                name = msg.name
                console.log(locations)

            break
            // gather returning 'pong' time

            case 'pong':
                let pongTime = Date.now() - msg.data
                pings[msg.name] = pongTime
                // let pongUpdate = JSON.stringify({
                //     cmd: 'pongTimes',
                //     data: pings
                // })
                // broadcast(pongUpdate)
                
                // console.log(pingTime)
                // broadcast(pingTime)
                // console.log('pings @ pong msg:', pings)
            break
            // in case you want to receive other data and route it elsewhere
            case 'OSC':
                // inform user
                // console.log('sending to remote:\n', message)
                // package data for the web, send it!
                // if(ws){
                    // now using a broadcast server
                broadcast(JSON.stringify(msg))
                
            break;

        
            default:
                console.log('client sent message with unknown cmd: ' + message)
                // ws.send('server received message but did not understand: ' +  msg)
            break;

        

        }
    });

    ws.on('close', function(code, reason) {
        delete locations[name]
        name = null
        console.log(locations)
    })
});
// we can use this if we want to send to multiple clients!
function broadcast(msg){
    wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
    }
    });
}


// periodically send out the global ping/pong times
//// note: not using this as of our latest meeting. instead pingpong times are sent via osc
function reportPings(){
    heart.createEvent(1, function(count, last){
        let pingReport = JSON.stringify({
            cmd: 'pingReport',
            data: pings
        })
        broadcast(pingReport)
    });
}
reportPings()

function reportLocations(){
    heart.createEvent(1, function(count, last){
        let locationReport = JSON.stringify({
            cmd: 'locationReport',
            data: locations
        })
        broadcast(locationReport)
        
    });
}
reportLocations()