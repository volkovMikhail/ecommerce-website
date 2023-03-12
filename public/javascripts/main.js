// fade out for flash messages
setTimeout(function () {
  $('#flash-msg').fadeOut('slow');
}, 3000);

setTimeout(function () {
  $('#success').fadeOut('slow');
}, 3000);

setTimeout(function () {
  $('#error').fadeOut('slow');
}, 3000);

const sortSelect = document.querySelector('#sortSelect');

sortSelect.addEventListener('change', (e) => {
  const sortKey = e.target.value;
  const url = new URL(window.location.href);
  url.searchParams.set('sort', sortKey);
  window.location.href = url;
});
