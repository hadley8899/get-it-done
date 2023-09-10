@component('mail::message')
Hi, {{ auth()->user()->name }} has invited you to join the workspace {{ $workspace->name }}

<br/>
It looks like you don't have an account yet. Please click the button below to create an account and join the workspace.

@component('mail::button', ['url' => $url])
Accept Invitation
@endcomponent

If you did not request to join the workspace, please ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
