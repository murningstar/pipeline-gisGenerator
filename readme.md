# Генератор геоданных

## Contents:

1. Description
2. System requirements
3. Easiest Step by step Guide to load OSM data into Postgis via osm2pgsql

## 1. Description
...
## 2. Requirements

### Info from osm2pgsql docs and docs of similar tools.

There is basically mentioned that **needed RAM size** is **somewhere twice(2x) as much as dataset's size**

### My personal recommendation for Docker-Desktop.

My personal recomendation for usage within Docker desktop is picking **dataset 3 times smaller than your device's RAM size** and **also reserve same amount of space on your SSD/HDD (3 times larger than dataset once again)**

## 3. Guide (unfinished) 
1. Скачать .pbf датасет с openstreetview
   _а если точнее, то с **datafabrik**, т.к. там можно скачать датасеты по регионам, т.к. чтобы обработать датасет всей планеты, нужно как минимум столько же RAM, сколько вес датасета. Это ограничение всех утилит переноса osm в postgis_
2. `docker-compose up`
3. Заходим в контейнер с osm2pgsql.
   С помощью UI в docker desktop (кнока CLI)
   Или: 1) `docker container ls` 2) копируем id контрейнера osm2pgsql 3) `docker exec -it -d <id_контейнера>` 4)

/osm2pgsql/build/osm2pgsql -c -d osm -U postgres -W -H postgis -S /osm2pgsql/default.style /mnt/dataset/<your-dataset-name>.osm.pbf

-    `/osm2pgsql/build/osm2pgsql`
-    `-c`
-    `-d osm`
-    `-U postgres`
-    `-W`
-    `-H postgis`
-    `-S /osm2pgsql/default.style`
-    `/mnt/dataset/<your-dataset-name>.osm.pbf`
