#!/usr/bin/env bash
# Lance les tests de la base sur un PostgreSQL local (variables PGHOST, PGPORT, PGUSER…).
set -euo pipefail
DB="pcf_test_$$"
psql -d postgres -qc "create database $DB"
trap 'psql -d postgres -qc "drop database if exists $DB"' EXIT
cd "$(dirname "$0")/../.."
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f tests/base-de-donnees/simulateur-supabase.sql
for i in 1 2; do  # deux fois : les scripts doivent pouvoir être relancés sans erreur
  for f in supabase/etape-*.sql; do
  psql -d "$DB" -q -v ON_ERROR_STOP=1 -f "$f" 2>&1 | { grep -v -e "does not exist, skipping" -e "already exists, skipping" || true; }
  done
done
for t in tests/base-de-donnees/etape-*.sql; do
  # chaque série de tests part d'une base propre
  PGOPTIONS="-c client_min_messages=warning" psql -d "$DB" -q -c "truncate auth.users cascade" >/dev/null
  psql -d "$DB" -q -v ON_ERROR_STOP=1 -f "$t" 2>&1 >/dev/null | sed "s/^psql:[^ ]* NOTICE:  /  /"
done
PGOPTIONS="-c client_min_messages=warning" psql -d "$DB" -q -c "truncate auth.users cascade" >/dev/null
PCF_DB="$DB" node tests/base-de-donnees/parite.mjs
