<?php

namespace Kirby\Content;

use Kirby\Cms\Language;
use Kirby\Content\PlainTextStorage;
use Kirby\Content\VersionId;

class MixedStorage extends PlainTextStorage
{
    protected array $virtual = [];

    /**
     * Read the original content from disk and merge it with the virtual content
     */
	public function read(VersionId $versionId, Language $language): array
	{
        $content = parent::read($versionId, $language);

        return [
            ...$this->readVirtual($versionId, $language),
            ...$content,
        ];
	}

    /**
     * Check if the page exists on disk and otherwise check if there is any virtual content
     */
    public function exists(VersionId $versionId, Language $language): bool
    {
        return parent::exists($versionId, $language) || $this->readVirtual($versionId, $language) !== [];
    }

    /**
     * Read virtual content for a given version and language from our
     * in-memory storage array
     */
    public function readVirtual(VersionId $versionId, Language $language): array
    {
        return $this->virtual[$versionId->value()][$language->code()] ?? [];
    }

    /**
     * Write virtual content for a given version and language to our
     * in-memory storage array
     */
    public function writeVirtual(VersionId $versionId, Language $language, array $data): void
    {
        $this->virtual[$versionId->value()][$language->code()] = $data;
    }
}
