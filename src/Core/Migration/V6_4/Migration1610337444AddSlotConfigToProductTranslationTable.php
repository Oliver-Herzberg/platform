<?php declare(strict_types=1);

namespace Shopware\Core\Migration\V6_4;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - Migrations will be internal in v6.5.0
 */
class Migration1610337444AddSlotConfigToProductTranslationTable extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1610337444;
    }

    public function update(Connection $connection): void
    {
        $sql = <<<'SQL'
ALTER TABLE `product_translation`
    ADD COLUMN `slot_config` JSON AFTER `custom_fields`,
    ADD CONSTRAINT `json.product_translation.slot_config` CHECK (JSON_VALID(`slot_config`))
SQL;
        $connection->executeStatement($sql);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
