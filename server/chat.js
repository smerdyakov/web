const WebSocket = require('ws');

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
  this.broadcastHelper = (message, cont) => {
    for(let id in this.clients) {
      const other = this.clients[id].wsocket;
  
      //delete websocket from chatroom if not open
      if (other.readyState != WebSocket.OPEN)
        delete clients[id];
      else
        cont(other, message);
    }
  };

  this.broadcast = (message) => {
    const cont = (wsocket, message) => {
      const msg = { username: 'CHATROOM', text: message, time: Date(), };
      wsocket.send(JSON.stringify(msg));
    }
    this.broadcastHelper(message, cont);
  }

  this.add = (client) => {
    this.clients[client.id] = client;
    this.broadcast(`${Utils.usernameOf(client.id)} entered the chat.`);

    client.broadcast = (message) => {
      this.broadcastHelper(message, (other, message) => {
        client.send(other, message);
      });
    };
  };
}

Chat = {
  Chatroom: Chatroom,
  Client: Client,
}

module.exports = Chat;
