<?php declare(strict_types=1);

namespace Shopware\Core\DevOps\StaticAnalyze\PHPStan\Rules;

use PhpParser\Node;
use PhpParser\Node\Stmt\ClassMethod;
use PHPStan\Analyser\Scope;
use PHPStan\Rules\Rule;
use PHPStan\Rules\RuleError;
use Shopware\Core\Content\ProductExport\ScheduledTask\ProductExportGenerateTask;
use Shopware\Core\Framework\MessageQueue\ScheduledTask\RequeueDeadMessagesTask;
use Shopware\Core\Framework\MessageQueue\ScheduledTask\ScheduledTask;

/**
 * @implements Rule<ClassMethod>
 *
 * @deprecated tag:v6.5.0 - reason:becomes-internal - will be internal in 6.5.0
 */
class ScheduledTaskTooLowIntervalRule implements Rule
{
    private const EXCEPTION_CLASSES = [
        RequeueDeadMessagesTask::class, // Will be deleted in next major and replaced with Symfony default
        ProductExportGenerateTask::class, // Ticket: NEXT-21167
    ];

    private const MIN_SCHEDULED_TASK_INTERVAL = 3600;

    public function getNodeType(): string
    {
        return ClassMethod::class;
    }

    /**
     * @param ClassMethod $node
     *
     * @return array<array-key, RuleError|string>
     */
    public function processNode(Node $node, Scope $scope): array
    {
        if ((string) $node->name !== 'getDefaultInterval') {
            return [];
        }

        $class = $scope->getClassReflection();

        if ($class === null || !$class->isSubclassOf(ScheduledTask::class) || $class->hasMethod('shouldRun')) {
            return [];
        }

        if (\in_array($class->getName(), self::EXCEPTION_CLASSES, true)) {
            return [];
        }

        foreach ($node->stmts ?? [] as $stmt) {
            if ($stmt instanceof Node\Stmt\Return_ && $stmt->expr instanceof Node\Scalar\LNumber) {
                $interval = (int) $stmt->expr->value;

                if ($interval < self::MIN_SCHEDULED_TASK_INTERVAL) {
                    return [
                        sprintf('Scheduled task has an interval of %d seconds, it should have an minimum of %d seconds.', $interval, self::MIN_SCHEDULED_TASK_INTERVAL),
                    ];
                }
            }
        }

        return [];
    }
}
