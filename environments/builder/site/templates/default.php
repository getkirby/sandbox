<?php foreach ($page->builder()->toBuilderBlocks() as $block): ?>
<?php snippet('blocks/' . $block->_key(), ['data' => $block]) ?>
<?php endforeach ?>
