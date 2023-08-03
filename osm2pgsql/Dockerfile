# Use Alpine Linux as the base image
FROM alpine

# Set working directory
WORKDIR /osm2pgsql

# necessary packages for osm2pgsql + git
RUN apk --update-cache add cmake make g++ boost-dev expat-dev
RUN apk --update-cache add bzip2-dev zlib-dev libpq proj-dev lua5.3-dev postgresql-dev
RUN apk --update-cache add git bash wget
RUN exec bash

# Clone the osm2pgsql repository
RUN git clone https://github.com/openstreetmap/osm2pgsql.git .

RUN mkdir -p /usr/local/include/nlohmann && \
    wget https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp -O /usr/local/include/nlohmann/json.hpp
# Build osm2pgsql
RUN mkdir build && cd build && \
    cmake .. && \
    # cmake .. -DNLOHMANN_INCLUDE_DIR=/usr/include/ && \
    make && \
    make install

# Set the entrypoint
COPY osm2pgsql_startup.sh /osm2pgsql/osm2pgsql_startup.sh
ENTRYPOINT ["/bin/bash", "/osm2pgsql/osm2pgsql_startup.sh"]
