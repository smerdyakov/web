const Utils = require('./utils.js');

/*
Meant to encapsulate the type/format of messages

E.g. clients talk in chatrooms via messages, which may be video, may contain
the time, etc.
*/

function Client(wsocket, request) {
  this.wsocket = wsocket;
  this.id = Utils.getCookieID(request);

  this.send = (destSocket, message) => {
    const msg = {
      username: Utils.usernameOf(this.id),
      text: message.text,
      time: message.time,
    } 
    destSocket.send(JSON.stringify(msg));
  };
}

function Chatroom() {
  this.clients = {};
  this.add = (client) => {
    //TODO: if client already exists, remove?
    this.clients[client.id] = client;

    client.broadcast = (message) => {
      for(let id in this.clients) {
        //TODO: if other is closed, remove from client list
        const other = this.clients[id].wsocket;
        client.send(other, message);
      }
    };
  };
}

Chat = {
  Chatroom: Chatroom,
  Client: Client,
}

module.exports = Chat;
