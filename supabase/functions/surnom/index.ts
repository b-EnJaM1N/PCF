// HandSlam — fonction « Surnom » (Supabase Edge Function) : Roland dit le surnom d'un joueur d'un trait.
//
// Décision du porteur du projet (2 novembre) : plus de 3 200 surnoms possibles, trop pour tous les enregistrer. On
// n'enregistre que les surnoms vraiment portés : au premier match d'un joueur connecté avec un surnom pas encore enregistré,
// l'appli demande ici sa voix. Elle est fabriquée une seule fois (ElevenLabs, voix de Roland), rangée dans le stockage
// public « surnoms » (surnoms/<nom>__<complement>.mp3), puis servie à tous les joueurs qui portent ce surnom.
//
// À créer dans Supabase (voir supabase/LISEZMOI.md, étape 55) : « Edge Functions » → « Deploy a new function » → « Via Editor »
// → nom : Surnom → coller tout ce fichier → « Deploy ». La clé ElevenLabs est un secret de Supabase (ELEVENLABS_API_KEY,
// « Edge Functions » → « Secrets ») : elle n'est jamais écrite dans le code.
//
// Les crédits sont protégés : seulement pour un joueur connecté, au plus PAR_JOUEUR surnoms nouveaux par jour et par joueur,
// et au plus PAR_JOUR pour tout le monde (table surnoms_voix, étape 55).

const PAR_JOUEUR = 3, PAR_JOUR = 60;
const ROLAND = "pwONJQic3ZwHTFG8D6uM";   // la voix de Roland (outils/voix.json : les Voice ID ne sont pas secrets)
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------------------------------------------------------- les surnoms (les mêmes que app/js/surnoms.js : un test le vérifie)
export const NOMS: Record<string, string> = {
  "la_loutre": "La Loutre",
  "la_limace": "La Limace",
  "la_buse": "La Buse",
  "le_cacatoes": "Le Cacatoès",
  "le_dindon": "Le Dindon",
  "le_pigeon": "Le Pigeon",
  "la_morue": "La Morue",
  "la_girafe": "La Girafe",
  "le_cobra": "Le Cobra",
  "le_scorpion": "Le Scorpion",
  "le_requin": "Le Requin",
  "le_faucon": "Le Faucon",
  "le_tigre": "Le Tigre",
  "la_panthere": "La Panthère",
  "le_bison": "Le Bison",
  "le_pitbull": "Le Pitbull",
  "le_croque_monsieur": "Le Croque-Monsieur",
  "la_saucisse": "La Saucisse",
  "la_quiche": "La Quiche",
  "le_cepe": "Le Cèpe",
  "la_truffe": "La Truffe",
  "le_poing": "Le Poing",
  "la_main": "La Main",
  "le_marteau": "Le Marteau",
  "le_bulldozer": "Le Bulldozer",
  "le_tank": "Le Tank",
  "la_foudre": "La Foudre",
  "la_tornade": "La Tornade",
  "l_ouragan": "L'Ouragan",
  "le_gladiateur": "Le Gladiateur",
  "le_cogneur": "Le Cogneur",
  "le_barbare": "Le Barbare",
  "le_viking": "Le Viking",
  "le_samourai": "Le Samouraï",
  "le_ninja": "Le Ninja",
  "le_menhir": "Le Menhir",
  "le_secateur": "Le Sécateur",
  "l_origami": "L'Origami",
  "le_phenix": "Le Phénix",
  "le_marathonien": "Le Marathonien",
  "le_gentleman": "Le Gentleman",
  "l_invaincu": "L'Invaincu",
  "le_patron": "Le Patron",
  "le_boss": "Le Boss",
  "le_taulier": "Le Taulier",
  "le_maitre": "Le Maître",
  "le_champion": "Le Champion",
  "le_crack": "Le Crack",
  "la_machine": "La Machine",
};
export const QUALIFICATIFS: Record<string, string> = {
  "du_dimanche": "du Dimanche",
  "de_l_apero": "de l'Apéro",
  "du_comptoir": "du Comptoir",
  "du_pmu": "du PMU",
  "de_la_cantine": "de la Cantine",
  "du_bureau": "du Bureau",
  "du_parking": "du Parking",
  "du_supermarche": "du Supermarché",
  "du_camping": "du Camping",
  "de_la_sieste": "de la Sieste",
  "du_canape": "du Canapé",
  "du_barbecue": "du Barbecue",
  "du_rond_point": "du Rond-Point",
  "de_la_plage": "de la Plage",
  "du_quartier": "du Quartier",
  "de_la_rue": "de la Rue",
  "de_la_street": "de la Street",
  "du_bitume": "du Bitume",
  "de_la_cite": "de la Cité",
  "du_ring": "du Ring",
  "de_l_arene": "de l'Arène",
  "de_la_jungle": "de la Jungle",
  "du_desert": "du Désert",
  "des_iles": "des Îles",
  "du_village": "du Village",
  "d_acier": "d'Acier",
  "de_titane": "de Titane",
  "de_beton": "de Béton",
  "de_marbre": "de Marbre",
  "de_plomb": "de Plomb",
  "de_cristal": "de Cristal",
  "de_velours": "de Velours",
  "de_soie": "de Soie",
  "d_or": "d'Or",
  "en_dentelle": "en Dentelle",
  "a_paillettes": "à Paillettes",
  "de_feu": "de Feu",
  "de_glace": "de Glace",
  "de_lave": "de Lave",
  "de_braise": "de Braise",
  "de_givre": "de Givre",
  "de_tempete": "de Tempête",
  "de_brume": "de Brume",
  "de_lune": "de Lune",
  "redoutable": "Redoutable",
  "implacable": "Implacable",
  "impitoyable": "Impitoyable",
  "invincible": "Invincible",
  "inarretable": "Inarrêtable",
  "intraitable": "Intraitable",
  "terrible": "Terrible",
  "sauvage": "Sauvage",
  "de_la_nuit": "de la Nuit",
  "de_l_ombre": "de l'Ombre",
  "du_chaos": "du Chaos",
  "du_dimanche_soir": "du Dimanche Soir",
  "du_cercle": "du Cercle",
  "du_circuit": "du Circuit",
  "des_titans": "des Titans",
  "des_legendes": "des Légendes",
  "des_immortels": "des Immortels",
  "des_champions": "des Champions",
  "de_l_eternite": "de l'Éternité",
  "de_la_gloire": "de la Gloire",
  "du_destin": "du Destin",
  "de_l_empire": "de l'Empire",
};

// Le fichier d'un surnom (ou null si le surnom n'existe pas).
export function cleSurnom(nom: string, complement: string) {
  return Object.hasOwn(NOMS, nom) && Object.hasOwn(QUALIFICATIFS, complement) ? `${nom}__${complement}` : null;
}
// Ce que dit Roland (avec le ton, comme les autres répliques : outils/voix.json, rôle « speaker »).
export const texteSurnom = (nom: string, complement: string) =>
  `[excited] [like a French radio sports commentator] ${NOMS[nom]} ${QUALIFICATIFS[complement]} !`;

// ---------------------------------------------------------------- la fonction
const repondre = (corps: unknown, statut = 200) =>
  new Response(JSON.stringify(corps), { status: statut, headers: { ...CORS, "Content-Type": "application/json" } });

// deno-lint-ignore no-explicit-any
declare const Deno: any;

if (typeof Deno !== "undefined") Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const URL_BASE = Deno.env.get("SUPABASE_URL"), SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const CLE_VOIX = Deno.env.get("ELEVENLABS_API_KEY");
    if (!CLE_VOIX) return repondre({ erreur: "Clé ElevenLabs absente (secret ELEVENLABS_API_KEY)" }, 500);
    const service = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

    // Qui demande ? (seulement un joueur connecté)
    const jeton = (req.headers.get("Authorization") || "").replace(/^Bearer /, "");
    const qui = await fetch(`${URL_BASE}/auth/v1/user`, { headers: { apikey: SERVICE, Authorization: `Bearer ${jeton}` } });
    if (!qui.ok) return repondre({ erreur: "Il faut être connecté" }, 401);
    const uid = (await qui.json()).id;

    const { nom, complement } = await req.json();
    const cle = cleSurnom(String(nom), String(complement));
    if (!cle) return repondre({ erreur: "Surnom inconnu" }, 400);
    const adresse = `${URL_BASE}/storage/v1/object/public/surnoms/${cle}.mp3`;

    // Déjà enregistré : rien à faire.
    if ((await fetch(adresse, { method: "HEAD" })).ok) return repondre({ adresse, deja: true });

    // Les limites (dernières 24 heures).
    const depuis = new Date(Date.now() - 86400000).toISOString();
    const compter = async (filtre: string) => {
      const r = await fetch(`${URL_BASE}/rest/v1/surnoms_voix?select=cle&cree_le=gte.${depuis}${filtre}`,
        { headers: { ...service, Prefer: "count=exact", Range: "0-0" } });
      return Number((r.headers.get("content-range") || "*/0").split("/")[1]) || 0;
    };
    if (await compter(`&par=eq.${uid}`) >= PAR_JOUEUR) return repondre({ erreur: "Limite du jour atteinte pour ce joueur" }, 429);
    if (await compter("") >= PAR_JOUR) return repondre({ erreur: "Limite du jour atteinte" }, 429);

    // La voix de Roland (même modèle et mêmes réglages que les autres répliques).
    const voix = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ROLAND}?output_format=mp3_44100_64`, {
      method: "POST",
      headers: { "xi-api-key": CLE_VOIX, "Content-Type": "application/json" },
      body: JSON.stringify({ text: texteSurnom(nom, complement), model_id: "eleven_v3", language_code: "fr", voice_settings: { stability: 0 } }),
    });
    if (!voix.ok) return repondre({ erreur: `ElevenLabs : ${voix.status}` }, 502);
    const son = new Uint8Array(await voix.arrayBuffer());

    // Rangée dans le stockage public, puis notée (pour les limites).
    const depot = await fetch(`${URL_BASE}/storage/v1/object/surnoms/${cle}.mp3`, {
      method: "POST", headers: { ...service, "Content-Type": "audio/mpeg", "x-upsert": "true", "Cache-Control": "max-age=31536000" }, body: son,
    });
    if (!depot.ok) return repondre({ erreur: `Stockage : ${depot.status}` }, 500);
    await fetch(`${URL_BASE}/rest/v1/surnoms_voix`, {
      method: "POST", headers: { ...service, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({ cle, par: uid }),
    });
    return repondre({ adresse, deja: false });
  } catch (e) {
    return repondre({ erreur: String((e as Error)?.message || e) }, 500);
  }
});
