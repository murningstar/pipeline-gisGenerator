# Use Alpine Linux as the base image
FROM alpine

# Set working directory
WORKDIR /osm2pgsql

# necessary packages for osm2pgsql + git
RUN apk --update-cache add cmake make g++ boost-dev expat-dev \
      bzip2-dev zlib-dev libpq proj-dev lua5.3-dev postgresql-dev
RUN apk --update-cache add git
RUN apk --update-cache add bash

# Clone the osm2pgsql repository
RUN git clone https://github.com/openstreetmap/osm2pgsql.git .

# Build osm2pgsql
RUN mkdir build && cd build && \
    cmake .. && \
    make && \
    make install

# Set the entrypoint
COPY osm2pgsql_startup.sh /osm2pgsql/osm2pgsql_startup.sh
ENTRYPOINT ["/bin/bash", "/osm2pgsql/osm2pgsql_startup.sh"]