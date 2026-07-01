<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use NotificationChannels\WebPush\Events\NotificationSent;
use NotificationChannels\WebPush\Events\NotificationFailed;
use Illuminate\Mail\MailManager;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use GuzzleHttp\Client;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mime\MessageConverter;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Ensure OpenSSL can find openssl.cnf in XAMPP Windows environment
        if (function_exists('putenv') && !getenv('OPENSSL_CONF')) {
            try {
                @putenv('OPENSSL_CONF=d:\Installed_Programs\xampp\apache\conf\openssl.cnf');
            } catch (\Throwable $e) {
                // Ignore if putenv is disabled/restricted on shared hosting
            }
        }

        // Listen for WebPush events to debug delivery reports
        Event::listen(NotificationSent::class, function (NotificationSent $event) {
            Log::info('WebPush NotificationSent event payload:', json_decode(json_encode($event->report), true));
        });

        Event::listen(NotificationFailed::class, function (NotificationFailed $event) {
            Log::error('WebPush NotificationFailed event payload:', json_decode(json_encode($event->report), true));
        });

        if (config('app.env') === 'production') {
            \URL::forceScheme('https');
        }

        // Dynamically register the brevo mailer config in case configuration is cached on the server
        config(['mail.mailers.brevo' => ['transport' => 'brevo']]);

        // Register custom Brevo API Mail Transport to bypass shared hosting SMTP blocks
        $this->app->make(MailManager::class)->extend('brevo', function () {
            return new class(new Client()) extends AbstractTransport {
                public function __construct(private Client $client) {
                    parent::__construct();
                }

                protected function doSend(SentMessage $message): void
                {
                    $email = MessageConverter::toEmail($message->getOriginalMessage());
                    
                    $to = [];
                    foreach ($email->getTo() as $recipient) {
                        $name = $recipient->getName();
                        if (empty($name)) {
                            $name = explode('@', $recipient->getAddress())[0];
                        }
                        $to[] = ['email' => $recipient->getAddress(), 'name' => $name];
                    }

                    $fromName = $email->getFrom()[0]->getName();
                    if (empty($fromName)) {
                        $fromName = config('mail.from.name', 'Pulse');
                    }
                    $from = ['email' => $email->getFrom()[0]->getAddress(), 'name' => $fromName];
                    
                    $payload = [
                        'sender' => $from,
                        'to' => $to,
                        'subject' => $email->getSubject(),
                    ];

                    if ($email->getHtmlBody()) {
                        $payload['htmlContent'] = $email->getHtmlBody();
                    } else {
                        $payload['textContent'] = $email->getTextBody();
                    }

                    $this->client->post('https://api.brevo.com/v3/smtp/email', [
                        'headers' => [
                            'api-key' => env('BREVO_API_KEY'),
                            'Content-Type' => 'application/json',
                        ],
                        'json' => $payload,
                    ]);
                }

                public function __toString(): string
                {
                    return 'brevo';
                }
            };
        });
    }
}
