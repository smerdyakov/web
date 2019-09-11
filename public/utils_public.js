function utils_logout () {
  fetch('/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    credentials: 'include',
  })
  .then( response => {
    return response.text();
  })
  .then( text => {
    console.log(text);

    //Set cookie to expire
    document.cookie += '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.replace('/login.html');
  });

  return false;
}
