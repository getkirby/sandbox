var input = document.getElementById('input');
var form  = document.querySelector('form');

input.addEventListener('paste', function (e) {
  var html = e.clipboardData.getData('text/html');
  var text = e.clipboardData.getData('text/plain');

  e.preventDefault();
  e.target.value = html.length !== 0 ? html : text;

  form.submit();
});

input.addEventListener('keydown', function (e) {

  if (e.metaKey === true && e.key === "Enter") {
    e.preventDefault();
    form.submit();
    return;
  }

  if (e.metaKey === true && e.key === "s") {
    e.preventDefault();
    form.submit();
    return;
  }

});
