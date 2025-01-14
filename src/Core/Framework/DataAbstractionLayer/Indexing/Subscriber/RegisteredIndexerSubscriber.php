<?php declare(strict_types=1);

namespace Shopware\Core\Framework\DataAbstractionLayer\Indexing\Subscriber;

use Shopware\Core\Framework\DataAbstractionLayer\Indexing\EntityIndexerRegistry;
use Shopware\Core\Framework\Migration\IndexerQueuer;
use Shopware\Core\Framework\Store\Event\FirstRunWizardFinishedEvent;
use Shopware\Core\Framework\Update\Event\UpdatePreFinishEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - EventSubscribers will become internal in v6.5.0
 */
class RegisteredIndexerSubscriber implements EventSubscriberInterface
{
    private IndexerQueuer $indexerQueuer;

    private EntityIndexerRegistry $indexerRegistry;

    /**
     * @internal
     */
    public function __construct(IndexerQueuer $indexerQueuer, EntityIndexerRegistry $indexerRegistry)
    {
        $this->indexerQueuer = $indexerQueuer;
        $this->indexerRegistry = $indexerRegistry;
    }

    /**
     * @return array<string, string|array{0: string, 1: int}|list<array{0: string, 1?: int}>>
     */
    public static function getSubscribedEvents()
    {
        return [
            UpdatePreFinishEvent::class => 'runRegisteredIndexers',
            FirstRunWizardFinishedEvent::class => 'runRegisteredIndexers',
        ];
    }

    /**
     * @internal
     */
    public function runRegisteredIndexers(): void
    {
        $queuedIndexers = $this->indexerQueuer->getIndexers();

        if (empty($queuedIndexers)) {
            return;
        }

        $this->indexerQueuer->finishIndexer(array_keys($queuedIndexers));

        foreach ($queuedIndexers as $indexerName => $options) {
            $indexer = $this->indexerRegistry->getIndexer($indexerName);

            if ($indexer === null) {
                continue;
            }

            // If we don't have any required indexer, schedule all
            if ($options === []) {
                $this->indexerRegistry->sendIndexingMessage([$indexerName]);

                continue;
            }

            $skipList = array_values(array_diff($indexer->getOptions(), $options));

            $this->indexerRegistry->sendIndexingMessage([$indexerName], $skipList);
        }
    }
}
