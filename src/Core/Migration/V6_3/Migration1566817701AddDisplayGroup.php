<?php declare(strict_types=1);

namespace Shopware\Core\Migration\V6_3;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - Migrations will be internal in v6.5.0
 */
class Migration1566817701AddDisplayGroup extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1566817701;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('ALTER TABLE `product` ADD `display_group` varchar(50) NULL AFTER `display_in_listing`;');
    }

    public function updateDestructive(Connection $connection): void
    {
        $connection->executeStatement('ALTER TABLE `product` DROP COLUMN `display_in_listing`;');
    }
}
