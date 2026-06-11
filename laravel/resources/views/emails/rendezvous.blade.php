<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ $action === 'cree' ? 'Confirmation' : ($action === 'modifie' ? 'Modification' : ($action === 'annule' ? 'Annulation' : 'Rappel')) }} de rendez-vous</title>
    <style>
        body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #f4f7fa; margin: 0; padding: 30px 0; color: #1a2332; }
        .wrap { max-width: 580px; margin: 0 auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(10,92,138,0.08); }
        .header { background: linear-gradient(135deg, #0a5c8a 0%, #1a8cbf 100%); padding: 30px 28px; color: #fff; text-align: center; }
        .header h1 { font-size: 26px; font-weight: 800; margin: 8px 0 4px; letter-spacing: -0.02em; }
        .header h1 .blue { color: #bce0f5; }
        .header .sub { font-size: 11px; opacity: 0.85; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; }
        .icon { width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 12px; }
        .body { padding: 32px 28px; }
        .greeting { font-size: 17px; color: #0d1f2d; margin-bottom: 18px; font-weight: 600; }
        .msg { font-size: 14px; color: #4a6070; line-height: 1.65; margin-bottom: 24px; }
        .card { background: #f9fbfc; border-left: 4px solid #0a5c8a; border-radius: 8px; padding: 18px 22px; margin-bottom: 24px; }
        .card .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8edf2; font-size: 13px; }
        .card .row:last-child { border-bottom: none; }
        .card .row .label { color: #7a90a0; font-weight: 600; }
        .card .row .val { color: #0d1f2d; font-weight: 700; text-align: right; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 5px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-cree    { background: #e6f7f2; color: #0f6e56; }
        .badge-modifie { background: #fef3e2; color: #854f0b; }
        .badge-annule  { background: #fdeaea; color: #c0392b; }
        .badge-rappel  { background: #eef6fb; color: #0a5c8a; }
        .footer { background: #0d1f2d; padding: 20px 28px; color: rgba(255,255,255,0.65); font-size: 11px; text-align: center; }
        .footer strong { color: #fff; }
        .footer a { color: #1a8cbf; text-decoration: none; }
    </style>
</head>
<body>
    <div class="wrap">
        <div class="header">
            <div class="icon">
                @if($action === 'cree') ✅
                @elseif($action === 'modifie') ✏️
                @elseif($action === 'annule') ❌
                @else 🔔
                @endif
            </div>
            <h1>KDG <span class="blue">Health</span></h1>
            <div class="sub">Système de Gestion Hospitalière</div>
        </div>

        <div class="body">
            <div class="greeting">
                Bonjour {{ $rdv->patient->prenom ?? '' }} {{ $rdv->patient->nom ?? '' }},
            </div>

            <div class="msg">
                @if($action === 'cree')
                    Votre rendez-vous a été <strong style="color:#0f6e56;">confirmé</strong> avec succès. Nous avons le plaisir de vous accueillir prochainement dans notre établissement.
                @elseif($action === 'modifie')
                    Votre rendez-vous a été <strong style="color:#854f0b;">modifié</strong>. Veuillez prendre note des nouvelles informations ci-dessous.
                @elseif($action === 'annule')
                    Votre rendez-vous a été <strong style="color:#c0392b;">annulé</strong>. Pour reprogrammer, merci de contacter notre secrétariat.
                @else
                    Petit rappel concernant votre rendez-vous à venir. Pensez à arriver 10 minutes en avance.
                @endif
            </div>

            <div class="card">
                <div class="row">
                    <span class="label">Statut</span>
                    <span class="val">
                        <span class="badge badge-{{ $action }}">
                            @if($action === 'cree') Confirmé
                            @elseif($action === 'modifie') Modifié
                            @elseif($action === 'annule') Annulé
                            @else Rappel
                            @endif
                        </span>
                    </span>
                </div>
                <div class="row">
                    <span class="label">Date</span>
                    <span class="val">{{ \Carbon\Carbon::parse($rdv->date_heure)->locale('fr')->isoFormat('dddd D MMMM YYYY') }}</span>
                </div>
                <div class="row">
                    <span class="label">Heure</span>
                    <span class="val">{{ \Carbon\Carbon::parse($rdv->date_heure)->format('H:i') }}</span>
                </div>
                <div class="row">
                    <span class="label">Médecin</span>
                    <span class="val">Dr. {{ $rdv->medecin->nom ?? '—' }} {{ $rdv->medecin->prenom ?? '' }}</span>
                </div>
                @if($rdv->medecin && $rdv->medecin->specialite)
                <div class="row">
                    <span class="label">Spécialité</span>
                    <span class="val">{{ $rdv->medecin->specialite }}</span>
                </div>
                @endif
                @if($rdv->motif)
                <div class="row">
                    <span class="label">Motif</span>
                    <span class="val">{{ $rdv->motif }}</span>
                </div>
                @endif
                <div class="row">
                    <span class="label">N° dossier</span>
                    <span class="val">KDG-{{ str_pad($rdv->id, 6, '0', STR_PAD_LEFT) }}</span>
                </div>
            </div>

            @if($action !== 'annule')
                <div class="msg" style="background:#eef6fb;padding:14px 18px;border-radius:8px;color:#0a5c8a;font-size:12px;">
                    📍 <strong>Lieu :</strong> KDG Health · Avenue Léopold Sédar Senghor, Dakar<br>
                    📞 <strong>Pour modifier :</strong> +221 33 800 00 00<br>
                    ⏰ Merci d'arriver 10 min en avance avec votre carte d'identité et votre carte mutuelle.
                </div>
            @endif
        </div>

        <div class="footer">
            <strong>KDG Health</strong> · Hôpital de référence · Dakar, Sénégal<br>
            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
            Pour toute question : <a href="mailto:contact@kdghealth.sn">contact@kdghealth.sn</a>
        </div>
    </div>
</body>
</html>
