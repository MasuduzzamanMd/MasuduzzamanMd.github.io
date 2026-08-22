document.querySelectorAll('.yr').forEach(function (e) {
  e.textContent = new Date().getFullYear();
});
var btn = document.getElementById('menuBtn');
if (btn) {
  btn.addEventListener('click', function () {
    document.getElementById('navLinks').classList.toggle('open');
  });
}
