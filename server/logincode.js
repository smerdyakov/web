/*
Edit this file, then run browserify logincode.js > login.js
browserify is a npm package that allows me to access the npm package blakejs (a one-way hashing function) on the client-side.
Kirk 11Sep2019
*/

const username = document.querySelector('#username');
const password = document.querySelector('#password');
const loginMessage = document.querySelector('#loginmessage');
const enter = document.querySelector('#enter');
const newUser = document.querySelector('#newuser');

var blake = require('blakejs');

username.addEventListener('keyup', (evnt) => {
  if (evnt.keyCode == 13)
    sendCredentials();
});

password.addEventListener('keyup', (evnt) => {
  if (evnt.keyCode == 13)
    sendCredentials();
});

enter.addEventListener('click', (evnt) => {
  sendCredentials();
});

newUser.addEventListener('click', (evnt) => {
  sendNewUser();
});

function sendCredentials() {
  const uname = username.value;
  const pass = blake.blake2bHex(password.value);
  const creds = { username: uname, password: pass, };

  fetch('/login/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(creds),
  })
  .then( response => {
    return response.json();
  })
  .then( cert => {
    if (cert.accepted == false) {
      displayLoginFailure();
    } else {
      document.cookie = cert.cookie;
      window.location.assign('/index.html');
    }
  });
}

function sendNewUser() {
  const uname = username.value;
  const pass = blake.blake2bHex(password.value);
  const creds = { username: uname, password: pass, };

  fetch('/login/newuser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(creds),
  })
  .then( response => {
    return response.json();
  })
  .then( cert => {
      document.cookie = cert.cookie;
      window.location.assign('/index.html');
  });
}

function displayLoginFailure() {
  loginMessage.innerText = 'username/password could not be authenticated';
}
