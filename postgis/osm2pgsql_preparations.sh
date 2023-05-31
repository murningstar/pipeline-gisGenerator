#!/bin/bash
echo "$(date '+%d-%m-%Y %H:%M:%S') - Started Postgis preparations"
set -e
# su
# su postgres
createuser osmuser
createdb --encoding=UTF8 --owner=osmuser osm
psql osm --command='CREATE EXTENSION postgis;'
psql osm --command='CREATE EXTENSION hstore;'
echo "$(date '+%d-%m-%Y %H:%M:%S') - Postgis preparations are done..."