<?= css('assets/css/index.css') ?>
<?= css('assets/codemirror/lib/codemirror.css') ?>
<?= css('assets/codemirror/theme/duotone-dark.css') ?>

<form method="post">
<textarea id="select" placeholder="Select …">
{
  "query": "page('photography').children",
  "select": {
    "url": true,
    "id": true,
    "title": "page.title",
    "description": "page.description.kirbytext",
    "images": {
      "query": "page.images",
      "select": {
        "url": true,
        "niceSize": true,
        "alt": "file.alt.kirbytext"
      }
    }
  }
}
</textarea>
<textarea id="result"></textarea>
<input type="submit" value="Execute">
</form>

<?= js('assets/js/kirby.js') ?>
<?= js('assets/codemirror/lib/codemirror.js') ?>
<?= js('assets/codemirror/addon/edit/matchbrackets.js') ?>
<?= js('assets/codemirror/addon/comment/continuecomment.js') ?>
<?= js('assets/codemirror/addon/comment/comment.js') ?>
<?= js('assets/codemirror/mode/javascript/javascript.js') ?>
<script>

Kirby.options.api = '<?= url('api') ?>';
Kirby.options.csrf = '<?= option('api.csrf') ?>';

const form = document.querySelector("form");
const resultInput = document.querySelector("#result");
const selectInput = document.querySelector("#select");

const editor = CodeMirror.fromTextArea(selectInput, {
  autofocus: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  indentUnit: 2,
  tabSize: 2,
  theme: "duotone-dark",
  mode: "application/ld+json",
  lineWrapping: true,
  lineNumbers: true
});

const result = CodeMirror.fromTextArea(resultInput, {
  matchBrackets: true,
  autoCloseBrackets: true,
  indentUnit: 2,
  tabSize: 2,
  theme: "duotone-dark",
  mode: "application/ld+json",
  lineWrapping: false,
  lineNumbers: true,
  readOnly: true
});

const query = function() {

  try {
    const query = JSON.parse(editor.getValue());

    Kirby.query(query).then(response => {
      result.setValue(JSON.stringify(response, null ,2));
    });

  } catch (e) {
    alert(e);
  }

};

form.addEventListener("submit", function (e) {

  e.preventDefault();
  query();

});

query();

</script>
