<?php declare(strict_types=1);

namespace Shopware\Core\Migration\V6_3;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - Migrations will be internal in v6.5.0
 */
class Migration1558105657CurrencyPrices extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1558105657;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('ALTER TABLE `product_price` DROP FOREIGN KEY `fk.product_price.currency_id`');
        $connection->executeStatement('ALTER TABLE `product_price` DROP INDEX `fk.product_price.currency_id`;');
        $connection->executeStatement('ALTER TABLE `product_price` DROP `currency_id`;');
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
