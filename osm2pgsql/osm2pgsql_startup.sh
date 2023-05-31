#!/bin/bash

# Postgres container name and port
postgres_name="postgis"
postgres_port=5432

# Wait for the Postgis container to start
while ! nc -z $postgres_name $postgres_port; do
  echo "$(date '+%d-%m-%Y %H:%M:%S') - Waiting for Postgis to start on port $postgres_port..."  
  sleep 2
done

echo "$(date '+%d-%m-%Y %H:%M:%S') - Postgis is ready to accept connections!"

# Start printing a message without erasing previous outputs
while true
do
  echo "$(date '+%d-%m-%Y %H:%M:%S') - osm2pgsql container is up. Guide is here -> hub.docker.com/<this_image>"
  sleep 15
done