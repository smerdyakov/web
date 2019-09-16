const commentField = document.querySelector('#commentfield');
const commentButton = document.querySelector('#commentbutton');
const boundingBox = document.querySelector('#boundingbox');

function connect() {
  let serverUrl = "wss://" + document.location.hostname + ":3000";

  wsocket = new WebSocket(serverUrl, "json");
  wsocket.onopen = (evt) => {
    console.log("Websocket connected.");
  };

  wsocket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    console.log("Message received: " + data.text);
    post(data);
  }

  return wsocket;
}

function send(wsocket, text) {
  const message = {
    text,
    time: new Date(),
  };
  wsocket.send(JSON.stringify(message));
}

function formattedTime(dateObj) {

  const day = dateObj.getDate();
  const month = dateObj.getMonth() + 1;
  const year = dateObj.getFullYear();
  const hour = ((dateObj.getHours() - 1) % 12) + 1 ;
  const minute = (dateObj.getMinutes() < 10 ? '0' : '') + dateObj.getMinutes();
  const suffix = dateObj.getHours() >= 12 ? 'pm' : 'am';
  let timeStr = hour + ':' + minute + suffix;
  timeStr += ' on ' + month + '/' + day + '/' + year;
  return timeStr;

}

function newHeader(user, time) {
  const header = document.createElement('div');
  header.className = 'comment-header';
  const timeStr = formattedTime(new Date(time));
  header.innerHTML += '<span class=\'user-tag\'>' + user + '</span> ';
  header.innerHTML += ' - ' + timeStr + '<br>';
  return header;
}

function newContent(text) {
  const content = document.createElement('div');
  content.className = 'comment-content';
  content.innerHTML += text;
  return content;
}

function newComment(user, text, time) {
  const comment = document.createElement('div');
  comment.className = 'comment';

  comment.append(newHeader(user, time));
  comment.append(newContent(text));
  return comment;
}

function atScrollBottom() {
  const scrollElem = document.scrollingElement;
  const maxHeight = scrollElem.scrollHeight - scrollElem.clientHeight;
  return scrollElem.scrollTop == maxHeight;
}

function scrollToBottom() {
  const scrollElem = document.scrollingElement;
  const maxHeight = scrollElem.scrollHeight - scrollElem.clientHeight;
  scrollElem.scrollTop = maxHeight;
}

function post(data) {
  const {username, text, time} = data;
  const atBottom = atScrollBottom();
  boundingBox.append(newComment(username, text, time));
  if (atBottom)
    scrollToBottom();
}

wsocket = connect();

commentField.addEventListener('keyup', (evt) => {
  if (evt.keyCode == 13) {
    send(wsocket, commentField.value);
    commentField.value = '';
  }
});

commentButton.addEventListener('click', (evt) => {
  send(wsocket, commentField.value);
  commentField.value = '';
});
