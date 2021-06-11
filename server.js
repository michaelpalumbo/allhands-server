// note: this version is for running allhands' server locally

// alternative to setInterval:
var heartbeats = require('heartbeats');
// a heart that beats every 1 second.
var heart = heartbeats.createHeart(1000);
let pings = {
}

const WebSocket = require('ws');

//! For the heroku version, need to set the https and port together (grab it from earlier versions)
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', function connection(ws, req, client) {
    let thisName
    
    console.log('new connection established ')

    // start the ping/pong for calculating round-trip timing
    // Alternative to setInterval
    heart.createEvent(1, function(count, last){
        let pingMsg = JSON.stringify({
            cmd: 'ping',
            data: Date.now()
        })
        ws.send(pingMsg)
        
        // let namesMsg = JSON.stringify({
        //     cmd: 'whosConnected',
        //     data: Date.now(),
        //     data: names
        // })
        // ws.send(namesMsg)
    });

    ws.on('message', function incoming(message) {
        msg = JSON.parse(message)
        // console.log(msg)

        switch (msg.cmd){
            // gather returning 'pong' time
            case 'thisMachine':
                thisName = name

            break
            case 'pong':
                let pongTime = Date.now() - msg.data
                pings[msg.name] = pongTime

                // names[name] = {ping: pongTime}
                let pong = JSON.stringify({
                    cmd: 'pong',
                    name: msg.name,
                    time: pongTime
                })
                broadcast(pong)
            break
            case 'introduce':
                console.log(msg.data, 'connected to the server')
            break
            // in case you want to receive other data and route it elsewhere
            case 'OSC':
                // now using a broadcast server
                console.log('received data:\n', msg)
                broadcast(JSON.stringify(msg))
                
            break;

        
            default:
                console.log('client sent message with unknown cmd: ' + msg)
                // ws.send('server received message but did not understand: ' +  msg)
            break;
        }
    });

    ws.on('close', function(code, reason) {

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


