<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;
use NotificationChannels\WebPush\Events\NotificationSent;
use NotificationChannels\WebPush\Events\NotificationFailed;

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
        if (!getenv('OPENSSL_CONF')) {
            putenv('OPENSSL_CONF=d:\Installed_Programs\xampp\apache\conf\openssl.cnf');
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

        // Register custom Brevo API Mail Transport to bypass shared hosting SMTP blocks
        $this->app->make(\Illuminate\Mail\MailManager::class)->extend('brevo', function () {
            return new class(new \GuzzleHttp\Client()) extends \Symfony\Component\Mailer\Transport\AbstractTransport {
                public function __construct(private \GuzzleHttp\Client $client) {
                    parent::__construct();
                }

                protected function doSend(\Symfony\Component\Mailer\SentMessage $message): void
                {
                    $email = \Symfony\Component\Mime\MessageConverter::toEmail($message->getOriginalMessage());
                    
                    $to = [];
                    foreach ($email->getTo() as $recipient) {
                        $to[] = ['email' => $recipient->getAddress(), 'name' => $recipient->getName()];
                    }

                    $from = ['email' => $email->getFrom()[0]->getAddress(), 'name' => $email->getFrom()[0]->getName()];
                    
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
