<?php declare(strict_types=1);

namespace Shopware\Core\Content\Mail\Service;

use Shopware\Core\Framework\Feature;
use Shopware\Core\System\SystemConfig\SystemConfigService;
use Symfony\Component\Mailer\Transport;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mailer\Transport\SendmailTransport;
use Symfony\Component\Mailer\Transport\TransportInterface;

/**
 * @deprecated tag:v6.5.0 - reason:remove-decorator - Will be removed in v6.5.0, use MailerTransportLoader instead.
 */
class MailerTransportFactory extends Transport
{
    private SystemConfigService $configService;

    /**
     * @internal
     */
    public function __construct(iterable $factories, SystemConfigService $configService)
    {
        parent::__construct($factories);
        $this->configService = $configService;
    }

    public function fromString(string $dsn): TransportInterface
    {
        if (trim($this->configService->getString('core.mailerSettings.emailAgent')) === '') {
            return parent::fromString($dsn);
        }

        return $this->create();
    }

    public function create(?SystemConfigService $configService = null): TransportInterface
    {
        Feature::triggerDeprecationOrThrow(
            'v6.5.0.0',
            Feature::deprecatedClassMessage(__CLASS__, 'v6.5.0.0')
        );

        if ($configService === null) {
            $configService = $this->configService;
        }

        $emailAgent = $configService->getString('core.mailerSettings.emailAgent');

        if ($emailAgent === '') {
            $dsn = new Dsn(
                'sendmail',
                'default'
            );

            return $this->fromDsnObject($dsn);
        }

        switch ($emailAgent) {
            case 'smtp':
                return $this->createSmtpTransport($configService);
            case 'local':
                return new SendmailTransport($this->getSendMailCommandLineArgument($configService));
            default:
                throw new \RuntimeException(sprintf('Invalid mail agent given "%s"', $emailAgent));
        }
    }

    protected function createSmtpTransport(SystemConfigService $configService): TransportInterface
    {
        Feature::triggerDeprecationOrThrow(
            'v6.5.0.0',
            Feature::deprecatedClassMessage(__CLASS__, 'v6.5.0.0')
        );

        $dsn = new Dsn(
            $this->getEncryption($configService) === 'ssl' ? 'smtps' : 'smtp',
            $configService->getString('core.mailerSettings.host'),
            $configService->getString('core.mailerSettings.username'),
            $configService->getString('core.mailerSettings.password'),
            $configService->getInt('core.mailerSettings.port'),
            $this->getEncryption($configService) !== null ? [] : ['verify_peer' => 0]
        );

        return $this->fromDsnObject($dsn);
    }

    private function getEncryption(SystemConfigService $configService): ?string
    {
        $encryption = $configService->getString('core.mailerSettings.encryption');

        switch ($encryption) {
            case 'ssl':
                return 'ssl';
            case 'tls':
                return 'tls';
            default:
                return null;
        }
    }

    private function getSendMailCommandLineArgument(SystemConfigService $configService): string
    {
        $command = '/usr/sbin/sendmail ';

        $option = $configService->getString('core.mailerSettings.sendMailOptions');

        if ($option === '') {
            $option = '-t';
        }

        if ($option !== '-bs' && $option !== '-t') {
            throw new \RuntimeException(sprintf('Given sendmail option "%s" is invalid', $option));
        }

        return $command . $option;
    }
}
