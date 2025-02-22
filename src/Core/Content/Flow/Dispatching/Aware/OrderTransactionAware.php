<?php declare(strict_types=1);

namespace Shopware\Core\Content\Flow\Dispatching\Aware;

use Shopware\Core\Framework\Event\FlowEventAware;

interface OrderTransactionAware extends FlowEventAware
{
    public const ORDER_TRANSACTION_ID = 'orderTransactionId';

    public const ORDER_TRANSACTION = 'orderTransaction';

    public function getOrderTransactionId(): string;
}
