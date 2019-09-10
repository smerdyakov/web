function utils_logout () {
  document.cookie += '; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  window.location.replace('/login.html');
  return true;
}
