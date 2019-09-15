const WebSocket = require('ws');

const Utils = require('./utils.js');

/*
Meant to encapsulate the type/format of messages

E.g. clients talk in chatrooms via messages, which may be video, may contain
the time, etc.
*/

function makeMessage(name, text, time) {
  const message = {
    username: name,
    text,
    time,
  };
  return message;
}

function broadcastHelper(chatroom, message) {
  Utils.logMessage(chatroom.id, message);
  for(let id in chatroom.clients) {
    const other = chatroom.clients[id];

    //delete websocket from chatroom if not open
    if (!other.open())
      delete chatroom.clients[id];
    else
      other.send(message);
  }
}

function Client(wsocket, request) {
  this.wsocket = wsocket;
  this.id = Utils.getCookieID(request);
  this.send = (message) => {
    wsocket.send(JSON.stringify(message)); 
  };
  this.open = () => {
    return wsocket.readyState == WebSocket.OPEN;
  };
}

function Chatroom(id) {
  this.id = id;
  this.clients = {};

  this.broadcast = (message) => {
    message = makeMessage(this.id, message, Date());
    broadcastHelper(this, message);
  }

  this.add = (client) => {
    this.clients[client.id] = client;
    const loggedMessages = Utils.loggedMessages(this.id);
    loggedMessages.forEach( message => { client.send(message);});
    this.broadcast(`${Utils.usernameOf(client.id)} entered the chat.`);

    client.broadcast = (message) => {
      message = makeMessage(Utils.usernameOf(client.id), message.text, message.time);
      broadcastHelper(this, message);
    };
  };
}

Chat = {
  Chatroom: Chatroom,
  Client: Client,
}

module.exports = Chat;
