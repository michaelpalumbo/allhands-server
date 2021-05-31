#!/usr/bin/env node
const cliProgress = require('cli-progress');
const { Client, Server } = require('node-osc');
const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const {argv} = require('yargs')

// if(argv.options){
//     console.log('allhands help\n\ncli args:\n\n     --local=true  : This will print any messages you send to the allhands network in the terminal console (to verify they\'re being received by allhands)\n\n      --log=true  : print all incoming messages to the terminal ')
//     process.exit()
// }

let host = 'localhost'

// we will now add a name to the address pattern of all local OSC messages that are to be sent over IP
let name = 'tester';

// ***** Local UDP Send & Receive Config ******* //
let localReceivePort = 7403
let localSendPort = 7404


let ws; // keep this here

localSend = new Client('127.0.0.1', localSendPort);

// run the app in client mode
// ***** Websocket ******* //
// WebSocket that will automatically attempt to reconnect if the connection is closed, or if the remote server goes down

const serverIP = host
const serverPort = 8081;
const serverWSAddress = `ws://${serverIP}:${serverPort}`;
// options for the reconnecting websocket
const rwsOptions = {
    // make rws use the webSocket module implementation
    WebSocket: WebSocket, 
    // ms to try reconnecting:
    connectionTimeout: 1000,
    //debug:true, 
}

// create a new progress bar instance and use shades_classic theme
const herokuWakeProgress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

// create a websocket
// console.log(`attempting to connect to server at ${serverWSAddress}`)
ws = new ReconnectingWebSocket(serverWSAddress, [], rwsOptions);

// start the progress bar with a total value of 200 and start value of 0
herokuWakeProgress.start(100, 0);
let progCount = 0
// if the server responds with an error
ws.addEventListener('error', () => {
    console.log(`\ncontacting allhands host, progress:`);
    progCount = progCount + 5
    herokuWakeProgress.update(progCount);

});
// on successful connection to server:
ws.addEventListener('open', () => {
    // stop the progress bar
    let finalCount = 100 - progCount
    herokuWakeProgress.update(finalCount);
    herokuWakeProgress.stop();
    console.log (`connected to allhands network!`)

    // console.log('\nlisten for OSC messages from allhands on port ' + localSendPort+ '\nsend OSC to allhands on port ' + localReceivePort)
    // console.log('\nto view startup options, quit and run again using:\nallhands --options')
});
// on close:
ws.addEventListener('close', () => {
    console.log("server connection closed");
    // start the progress bar with a total value of 200 and start value of 0
    herokuWakeProgress.start(100, 0);
    // localSend.close();
    // localReceive.close();
});
// handle messages
ws.addEventListener('message', (data) => {
    let msg = JSON.parse(data.data);
    switch (msg.cmd){
        // in case you want to receive other data and route it elsewhere
        case 'OSC':

            // prevent data loopback from server broadcast (i.e. we don't ewant to receive our own)
            if(msg.addressPattern.split('/')[1] != name){
                localSend.send(msg.addressPattern, msg.typeTagString, (err) => {
                    if (err) console.error(err);
                }); 

            }

            if(argv.log == 'true'){
                console.log(msg.addressPattern, msg.typeTagString)
            }   
            
        break;

        case "ping":
            ws.send(JSON.stringify({
                cmd: 'pong',
                date: Date.now(),
                data: name
            }))
        break

        default:
            // inform user that unknown message commang used
            //console.log('client sent message with unknown cmd: ' + JSON.stringify(msg))
        break;
    }
});

// sample data
let onoff = 0

function intervalFunc() {
    
    ap = '/' + name + '/button/1'
    message = {
        // cmd allows us to send other types of messages, ask Michael for more info if curious!
        cmd: 'OSC',
        date: new Date().toUTCString(),
        addressPattern: ap,
        // this is the data!
        typeTagString: onoff,
    }
    // inform user
    // console.log('sending to remote:\n', message)
    // package data for the web, send it!
    // if(ws){
    ws.send(JSON.stringify(message))
    // flip the bit
    console.log('Sending: ', ap, onoff)
    onoff = 1 - onoff

}
setInterval(intervalFunc,500);

