<?= css('assets/css/playground.css') ?>

<form class="p" method="POST">

  <header class="p-topbar">
    <div>Input</div>
    <div>JSON</div>
    <div>HTML</div>
  </header>

  <div class="p-panels">
    <div class="p-panel p-input">
      <textarea autofocus id="input" placeholder="Paste your HTML here" spellcheck="false" name="html"><?= htmlspecialchars(get('html')) ?></textarea>
    </div>
    <div class="p-panel p-json">
      <div class="p-blocks">
        <?php foreach ($blocks as $block): ?>
        <details>
            <summary><?= $block->type() ?></summary>
            <div>
                <?php if (count($block->content()->keys())): ?>
                <div>
                    <dl>
                        <?php foreach($block->content()->keys() as $key): ?>
                        <dt><?= $key ?></dt>
                        <dd><?= $block->content()->get($key)->or('-') ?></dd>
                        <?php endforeach ?>
                    </dl>
                </div>
                <?php endif ?>
            </div>
        </details>
        <?php endforeach ?>
      </div>
    </div>
    <div class="p-panel p-html">
      <textarea readonly spellcheck="false"><?= indent($blocks->toHtml()) ?></textarea>
    </div>
  </div>

</form>

<?= js ('assets/js/prism.js') ?>
<?= js ('assets/js/playground.js') ?>
