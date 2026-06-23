<x-mail::message>
# Welcome to Pulse Messenger!

Hi {{ $name }},

Great news! An administrator has reviewed and approved your registration request. Your account is now active and ready to use.

<x-mail::button :url="route('login')">
Log In to Pulse Messenger
</x-mail::button>

We're excited to have you on board!

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
