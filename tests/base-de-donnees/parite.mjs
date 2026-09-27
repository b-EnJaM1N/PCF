// Vérifie que le serveur (SQL) et l'application (app/js/regles.js) appliquent
// exactement les mêmes règles : 40 matchs au hasard, joués des deux côtés.
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { nouveauMatch, jouerCoup } from "../../app/js/regles.js";

const DB = process.env.PCF_DB;
let graine = 12345;
const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };

const A = "aaaaaaaa-0000-0000-0000-00000000000a", B = "bbbbbbbb-0000-0000-0000-00000000000b";
let sql = `\\set QUIET on
set client_min_messages = warning;
insert into auth.users values ('${A}', 'a@x'), ('${B}', 'b@x');
insert into profils (id, pseudo, numero) values ('${A}', 'Pa', 0), ('${B}', 'Pb', 0);
create or replace function pg_temp.qui(uid text) returns void language plpgsql as $$
begin execute 'reset role'; perform set_config('request.jwt.claim.sub', uid, false); execute 'set role authenticated'; end $$;
`;
const attendus = [];
for (let k = 0; k < 40; k++) {
  const format = { pointsParSet: [7, 11][k % 2], setsGagnants: [2, 3][Math.floor(k / 2) % 2] };
  const m = nouveauMatch(format), seq = [];
  while (!m.termine) { const a = Math.floor(hasard() * 3), b = Math.floor(hasard() * 3); seq.push([a, b]); jouerCoup(m, a, b); }
  attendus.push({ points: m.points, sets: m.sets, scores_sets: m.scoresSets, vainqueur: m.vainqueur, coups: m.coups.length });
  sql += `select pg_temp.qui('${A}');
do $$ declare d uuid; m int; s int[] := '{${seq.map(x => x.join(",")).map(x => `{${x}}`).join(",")}}'; i int; begin
  select id into d from creer_duel('${B}', ${format.pointsParSet}, ${format.setsGagnants});
  perform pg_temp.qui('${B}'); perform repondre_duel(d, true); perform pret(d);
  perform pg_temp.qui('${A}'); perform pret(d);
  for i in 1..array_length(s, 1) loop
    m := (select manche from duels where id = d);
    if (select phase from duels where id = d) = 'entre_sets' then perform pg_temp.qui('${A}'); perform pret(d); perform pg_temp.qui('${B}'); perform pret(d); end if;
    perform pg_temp.qui('${A}'); perform jouer(d, m, s[i][1]);
    perform pg_temp.qui('${B}'); perform jouer(d, m, s[i][2]);
  end loop;
  perform pg_temp.qui('${A}');
  raise warning 'RESULTAT %', (select json_build_object('points', points, 'sets', sets, 'scores_sets', scores_sets, 'vainqueur', vainqueur, 'coups', jsonb_array_length(coups), 'phase', phase) from duels where id = d);
end $$;
`;
}
const dossier = mkdtempSync(join(tmpdir(), "pcf-"));
writeFileSync(join(dossier, "parite.sql"), sql);
const r = spawnSync("psql", ["-d", DB, "-v", "ON_ERROR_STOP=1", "-f", join(dossier, "parite.sql")], { encoding: "utf8" });
if (r.status !== 0) { console.error(r.stderr); process.exit(1); }
const obtenus = [...r.stderr.matchAll(/RESULTAT (\{.*\})/g)].map(x => JSON.parse(x[1]));
if (obtenus.length !== attendus.length) { console.error(`ÉCHEC : ${obtenus.length} résultats pour ${attendus.length} matchs`); process.exit(1); }
attendus.forEach((e, i) => {
  const o = obtenus[i];
  const pareil = o.phase === "termine" && JSON.stringify(o.points) === JSON.stringify(e.points) && JSON.stringify(o.sets) === JSON.stringify(e.sets) &&
    JSON.stringify(o.scores_sets) === JSON.stringify(e.scores_sets) && o.vainqueur === e.vainqueur && o.coups === e.coups;
  if (!pareil) { console.error(`ÉCHEC : match ${i + 1} différent\n  application : ${JSON.stringify(e)}\n  serveur     : ${JSON.stringify(o)}`); process.exit(1); }
});
const coups = attendus.reduce((n, e) => n + e.coups, 0);
console.log(`  ok : mêmes règles sur le serveur et dans l'application (${attendus.length} matchs, ${coups} coups comparés)`);
