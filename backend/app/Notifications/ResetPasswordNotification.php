<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
     
    {
        $frontendUrl = config('app.frontend_url') . '/password/reset/?token=' . $this->token . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
                    ->subject('Reset Password Notification')
                    ->line('You are receiving this email because we received a password reset request for your account.')
                    ->action('Reset Password', $frontendUrl)
                    ->line('If you did not request a password reset, no further action is required.');
    }
}

