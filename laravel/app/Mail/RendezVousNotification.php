<?php

namespace App\Mail;

use App\Models\RendezVous;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RendezVousNotification extends Mailable
{
    use Queueable, SerializesModels;

    public RendezVous $rdv;
    public string $action; // "cree" | "modifie" | "annule" | "rappel"

    public function __construct(RendezVous $rdv, string $action = "cree")
    {
        $this->rdv = $rdv->loadMissing(['patient', 'medecin']);
        $this->action = $action;
    }

    public function envelope(): Envelope
    {
        $titres = [
            'cree'     => 'Confirmation de votre rendez-vous',
            'modifie'  => 'Modification de votre rendez-vous',
            'annule'   => 'Annulation de votre rendez-vous',
            'rappel'   => 'Rappel : rendez-vous à venir',
        ];

        return new Envelope(
            subject: '[KDG Health] ' . ($titres[$this->action] ?? 'Notification rendez-vous'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.rendezvous',
            with: [
                'rdv'    => $this->rdv,
                'action' => $this->action,
            ],
        );
    }
}
