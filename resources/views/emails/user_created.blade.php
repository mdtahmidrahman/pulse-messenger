<x-mail::message>
# Welcome to Pulse Messenger, {{ $user->name }}!

An administrator has created an account for you. Here are your login credentials:

**Email:** {{ $user->email }}
**Password:** {{ $rawPassword }}

Please log in and change your password as soon as possible.

<x-mail::button :url="route('login')">
Log in to Pulse Messenger
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
