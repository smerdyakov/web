const username = document.querySelector('#username');
const password = document.querySelector('#password');
const loginMessage = document.querySelector('#loginmessage');
const enter = document.querySelector('#enter');

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

function sendCredentials() {
  const uname = username.value;
  const pass = encrypt(password.value);
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

function displayLoginFailure() {
  loginMessage.innerText = 'username/password could not be authenticated';
}

function encrypt(pass) {
  /*
  Hash password to prevent server/network from seeing plaintext password?
  */
  return pass;
}
