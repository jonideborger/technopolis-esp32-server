
const express = require('express');
const osc = require("osc");
const SerialPort = require('serialport');
const socket = require('socket.io');

const config = require("./config.json");

const SERVER_PORT = config.serverPort;
const SOCKET_PORT = config.socketPort;

const app = express();
const io = socket(SOCKET_PORT);
const Readline = SerialPort.parsers.Readline;


/* OSC Set-up variables */
const oscLocalAddress = config.osc.listenAddress || "255.255.255.255";
const oscListenPort = config.osc.listenPort || 1234;
const oscRemoteAddress = config.osc.remoteAddress || "127.0.0.1";
const oscSendPort = config.osc.sendPort || 1235;

/* SERIAL Set-up variables */
const serialAddress = config.serial.address;
const serialBaudrate = config.serial.baudrate;

/* GLOBALS */
let identifiers = config.identifiers;

app.use(express.static('public'));

/*********************
 * SERIAL Set-up *
 ********************/
const parser = new Readline();

const serialPort = new SerialPort(serialAddress, {
    baudRate: serialBaudrate
  }, function (err) {
    if (err) {
      return console.log('Error: ', err.message);
    }
});

serialPort.pipe(parser)
parser.on('data', function (data) {
    console.log(`Raw serial data received: ${data}`)
    if (data != null || data != "" || data != undefined) {
        try {
            let parsed = JSON.parse(data);
            //let mappedValue = mapValue(parsed.n, parsed.v);
            if(parsed.n && identifiers[parsed.n]) {
                let id = identifiers[parsed.n];

                console.log(`Update game for ${id} (${parsed.n}; value: ${parsed.v})`);
                io.emit('/game/update', id, parsed.v);

            } else {
                console.log(`Update received; Identifier ${parsed.s} UNKNOWN`);
            }
            //sendOscCrewData(parsed.s, parsed.n, parsed.v);
            //socket.emit('/updateCrewData', parsed);
        } catch (error) {
            console.log(error);
        }
    }
});

parser.on('error', function (err) {
    console.error('Hmm..., error!');
    console.error(err);
    process.exit(1);
});



/*********************
 * SOCKET Set-up *
 ********************/

io.on('connection', (socket) => {
    console.log('a device connected');

    socket.on('*', function(event,data) {
        console.log(`Received ${event}: ${data}`);
    });

    socket.on('disconnect', function(){
        console.log('device disconnected');
    });

    socket.on('/test', function() {
        console.log('TEST')
    });

    //right now expecting value between 0-100
    socket.on('/client/update', (id, value ) => {
        console.log('update', id, value);
        io.emit('/game/update', id, value);
    });
});

/*********************
 * OSC Over UDP Setup *
 ********************/

const udpPort = new osc.UDPPort({
    localAddress: oscLocalAddress,
    localPort: oscListenPort,
    remoteAddress: oscRemoteAddress,
    remotePort: oscSendPort
});

udpPort.on('ready', function () {
    console.log("TP-ESP32 SERVER Ready to receive OSC messages on port:", oscListenPort);
});

udpPort.on('error', function (err) {
    console.log(err);
});  

udpPort.on('message', function (oscMessage) {
    console.log(`Received OSC-msg with a: ${oscMessage.address} and param: ${oscMessage.args}`);

    if(oscMessage.address === '/client/update') {
        //Expecting args[0] = id, args[1] = value 0 - 100
        io.emit('/game/update', oscMessage.args[0], oscMessage.args[1]);
    }
})

udpPort.open();

/*********************
 * HTTP SERVER Open *
 ********************/

app.listen(SERVER_PORT, () => console.log(`SERVER listening on port ${SERVER_PORT}`));
