<?php declare(strict_types=1);

namespace Shopware\Core\Migration\V6_4;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - Migrations will be internal in v6.5.0
 */
class Migration1638195971AddBaseAppUrl extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1638195971;
    }

    public function update(Connection $connection): void
    {
        try {
            $connection->executeStatement('ALTER TABLE `app` ADD `base_app_url` VARCHAR(1024) NULL AFTER `version`');
        } catch (\Exception $e) {
            // Column already exists
        }
    }

    public function updateDestructive(Connection $connection): void
    {
        // implement update destructive
    }
}
