const username = document.querySelector('#username');
const password = document.querySelector('#password');
const password2 = document.querySelector('#password2');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const enter = document.querySelector('#enter');
const statusMessage = document.querySelector('#statusmessage');

var blake = require('blakejs');

enter.addEventListener('click', (evnt) => {
  if(checkInformation()){
    sendNewUser();
  }
});

function checkInformation() {
  if (password.value != password2.value){
    statusMessage.innerText = 'Passwords do not match.';
    return false;
  }
  else if(password.value.length <=8){
    statusMessage.innerText = 'Passwords must be more than 8 characters.';
    return false;
  }
  else if(name.value.length==0){
    statusMessage.innerText = 'Please input your name.';
    return false;
  }
  else if(email.value.length==0){
    statusMessage.innerText = 'Please input your email.';
    return false;
  }
  return true;
}

function sendNewUser() {
  const creds = { username: username.value,
    hashedpass: blake.blake2bHex(password.value),
    name: name.value,
    email: email.value,
   };
  statusMessage.innerText = 'Success!';
  fetch('/newuser/add', {
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
      statusMessage.innerText = 'Username already taken.';
    } else {
      document.cookie = cert.cookie;
      window.location.assign('/index.html');
    }
  });
}
