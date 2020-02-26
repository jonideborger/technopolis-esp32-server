#TECHNOPOLIS ESP32 SERVER

##Configuration

the http-server is reachable through PORT 80

the socket-server is reachable through PORT 3000

the message the server is listening to:

*/client/update*
param1: id (int)
param2: value (int, 0-100)

There is no catch all listener, but, the server logs every connected and disconnected device.

The game is available through 'index.html', the mock-up controller through 'controller.html'


##Run

first time, or after pull: run npm install

*npm install*

afterwards run npm start

*npm start*
