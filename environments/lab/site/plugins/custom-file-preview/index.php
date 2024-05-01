<?php

use Kirby\Cms\File;
use Kirby\Panel\Ui\FilePreview;

class GlbFilePreview extends FilePreview
{
	public function __construct(
		public File $file,
		public string $component = 'k-glb-file-preview'
	) {
	}

	public static function accepts(File $file): bool
	{
		return $file->extension() === 'glb';
	}

	public function details(): array
	{
		return [
			...parent::details(),
			[
				'title' => 'Author',
				...$this->file->author()->yaml()[0]
			],
			[
				'title' => 'License',
				...$this->file->license()->yaml()[0]
			]
		];
	}

	public function props(): array
	{
		return [
			...parent::props(),
			'asset' => $this->file->kirby()->plugin('getkirby/custom-file-preview')->asset('model-viewer.min.js')->mediaUrl()
		];
	}
}

Kirby::plugin('getkirby/custom-file-preview', [
	'filePreviews' => [
		GlbFilePreview::class
	]
]);
