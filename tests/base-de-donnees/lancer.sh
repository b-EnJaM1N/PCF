#!/usr/bin/env bash
# Lance les tests de la base sur un PostgreSQL local (variables PGHOST, PGPORT, PGUSER…).
set -euo pipefail
DB="pcf_test_$$"
psql -d postgres -qc "create database $DB"
trap 'psql -d postgres -qc "drop database if exists $DB"' EXIT
cd "$(dirname "$0")/../.."
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f tests/base-de-donnees/simulateur-supabase.sql
for i in 1 2; do  # deux fois : le script doit pouvoir être relancé sans erreur
  psql -d "$DB" -q -v ON_ERROR_STOP=1 -f supabase/etape-2-comptes.sql 2>&1 | { grep -v -e "does not exist, skipping" -e "already exists, skipping" || true; }
done
psql -d "$DB" -q -v ON_ERROR_STOP=1 -f tests/base-de-donnees/etape-2.sql 2>&1 >/dev/null | sed "s/^psql:[^ ]* NOTICE:  /  /"
