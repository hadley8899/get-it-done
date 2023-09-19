@component('mail::message')
Hi, {{ $user->name }} has accepted the invite to join the workspace {{ $workspace->name }}

Thanks,<br>
{{ config('app.name') }}
@endcomponent
