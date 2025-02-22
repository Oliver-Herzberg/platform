<?php declare(strict_types=1);

namespace Shopware\Core\Migration\V6_3;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - Migrations will be internal in v6.5.0
 */
class Migration1574258788TaxRuleLanguageKey extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1574258788;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('ALTER TABLE `tax_rule_type_translation` DROP FOREIGN KEY `fk.tax_rule_type_translation.language_id`');
        $connection->executeStatement('ALTER TABLE `tax_rule_type_translation` ADD CONSTRAINT `fk.tax_rule_type_translation.language_id` FOREIGN KEY (`language_id`)
                  REFERENCES `language` (`id`) ON DELETE CASCADE ON UPDATE CASCADE');
    }

    public function updateDestructive(Connection $connection): void
    {
        // implement update destructive
    }
}
