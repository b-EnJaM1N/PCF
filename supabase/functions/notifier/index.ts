// PCF — fonction « notifier » (Supabase Edge Function) : envoie les notifications sur les téléphones.
//
// À créer dans Supabase (voir supabase/LISEZMOI.md) : « Edge Functions » → « Deploy a new function »
// → « Via Editor » → nom : notifier → coller tout ce fichier → « Deploy », puis désactiver « Verify JWT ».
//
// Deux usages :
//  * { action: "cle" }      → renvoie la clé publique d'envoi (le téléphone en a besoin pour s'abonner) ;
//  * { notification: 123 }  → envoie la notification n° 123 (inscrite par la base, voir etape-11-notifications.sql)
//                             et note le résultat (etape-12-test-notification.sql).
// Les clés d'envoi sont créées ici au premier appel et gardées dans la base (table config_push) :
// aucune clé secrète n'est écrite dans le code. Chaque notification n'est envoyée qu'une fois.

const ADRESSE_APPLI = "https://handslam.fr/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------------------------------------------------------- les messages (testés automatiquement)
export const texteFormat = (points: number, sets: number) =>
  `Sets de ${points} point${points > 1 ? "s" : ""} · ${sets === 1 ? "match en 1 set" : `${sets} sets gagnants`}`;

// evenement : "defi" | "accepte" | "tournoi" ; duel : la ligne du duel ; adv : { pseudo, numero } de l'adversaire.
export function message(evenement: string, duel: any, adv: { pseudo: string; numero: number }) {
  if (evenement === "test") return {
    titre: "🔔 Notification de test", texte: "Si tu lis ceci, les notifications marchent sur ce téléphone !", url: "./", tag: "test",
  };
  const qui = `${adv.pseudo}#${adv.numero}`;
  if (evenement === "defi") return {
    titre: `⚔️ ${qui} te défie !`,
    texte: `${texteFormat(duel.points_par_set, duel.sets_gagnants)} · ${duel.classe ? "duel officiel" : "duel amical"}. Touche pour répondre.`,
    url: "./?ouvrir=duels", tag: `duel-${duel.id}`,
  };
  if (evenement === "accepte") return {
    titre: `✅ ${qui} a accepté ton défi !`, texte: "Le match commence : viens vite !",
    url: "./?ouvrir=duels", tag: `duel-${duel.id}`,
  };
  return {
    titre: "🏆 Ton match de tournoi est prêt",
    texte: duel.phase === "presentation" ? `Contre ${qui}. Tu as 60 secondes pour arriver !` : `${qui} t'attend pour votre match.`,
    url: "./?ouvrir=tournois", tag: `duel-${duel.id}`,
  };
}

// ---------------------------------------------------------------- le service
const reponse = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...CORS, "Content-Type": "application/json" } });

async function servir(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const { createClient } = await import("npm:@supabase/supabase-js@2");
  const webpush = (await import("npm:web-push@3.6.7")).default;
  // @ts-ignore : Deno est fourni par Supabase
  const sb = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
  const corps = await req.json().catch(() => ({}));

  // Les clés d'envoi : créées une seule fois, puis relues.
  let { data: cles } = await sb.from("config_push").select("publique, privee").eq("id", 1).maybeSingle();
  if (!cles) {
    const k = webpush.generateVAPIDKeys();
    await sb.from("config_push").upsert({ id: 1, publique: k.publicKey, privee: k.privateKey }, { onConflict: "id", ignoreDuplicates: true });
    ({ data: cles } = await sb.from("config_push").select("publique, privee").eq("id", 1).single());
  }
  if (corps.action === "cle") return reponse({ cle: cles.publique });

  const id = Number(corps.notification);
  if (!id) return reponse({ erreur: "notification manquante" }, 400);
  // On « prend » la notification : si elle est déjà partie, on ne la renvoie pas.
  const { data: notif } = await sb.from("notifications").update({ envoye_le: new Date().toISOString() })
    .eq("id", id).is("envoye_le", null).select("duel_id, joueur, evenement").maybeSingle();
  if (!notif) return reponse({ ok: true, deja: true });
  let duel: any = null, adv: any = null;
  if (notif.duel_id) {
    ({ data: duel } = await sb.from("duels").select("*").eq("id", notif.duel_id).single());
    const advId = duel.j0 === notif.joueur ? duel.j1 : duel.j0;
    ({ data: adv } = await sb.from("profils").select("pseudo, numero").eq("id", advId).single());
  }
  const m = message(notif.evenement, duel, adv || { pseudo: "Un joueur", numero: 0 });

  webpush.setVapidDetails(ADRESSE_APPLI, cles.publique, cles.privee);
  const { data: abonnements } = await sb.from("abonnements_push").select("endpoint, p256dh, auth").eq("joueur", notif.joueur);
  let envoyees = 0; const erreurs: string[] = [];
  for (const a of abonnements || []) {
    try {
      await webpush.sendNotification({ endpoint: a.endpoint, keys: { p256dh: a.p256dh, auth: a.auth } }, JSON.stringify(m), { TTL: 600 });
      envoyees++;
    } catch (e: any) {
      // Appareil désabonné (application désinstallée, notifications coupées) : on l'oublie.
      if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from("abonnements_push").delete().eq("endpoint", a.endpoint);
      erreurs.push(e?.statusCode ? `refus ${e.statusCode}` : String(e?.message || e).slice(0, 80));
    }
  }
  // Le résultat, lisible par l'appli (notification de test) : « 1 appareil sur 1 », ou l'erreur rencontrée.
  const total = (abonnements || []).length;
  await sb.from("notifications").update({ resultat: `${envoyees} appareil${envoyees > 1 ? "s" : ""} sur ${total}${erreurs.length ? ` (${erreurs.join(", ")})` : ""}` }).eq("id", id);
  return reponse({ ok: true, envoyees });
}

// @ts-ignore : Deno est fourni par Supabase ; ailleurs (tests), on n'importe que les messages.
if (typeof Deno !== "undefined") Deno.serve(servir);
