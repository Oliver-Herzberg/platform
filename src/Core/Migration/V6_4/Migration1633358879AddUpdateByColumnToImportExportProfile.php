<?php declare(strict_types=1);

namespace Shopware\Core\Migration\V6_4;

use Doctrine\DBAL\Connection;
use Shopware\Core\Framework\Migration\MigrationStep;

/**
 * @deprecated tag:v6.5.0 - reason:becomes-internal - Migrations will be internal in v6.5.0
 */
class Migration1633358879AddUpdateByColumnToImportExportProfile extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1633358879;
    }

    public function update(Connection $connection): void
    {
        $connection->executeStatement('ALTER TABLE `import_export_profile` ADD `update_by` json NULL AFTER `mapping`');
    }

    public function updateDestructive(Connection $connection): void
    {
        // implement update destructive
    }
}
