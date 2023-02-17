# imdb_api

## to run project locally:

### in root directory run: `docker compose up -d`

or

### `docker compose up -d --scale search-service=no_of_instances --scale title-service=no_of_instances`


## search titles:
http://localhost:5000/search/title?title={query}

## get title details:
http://localhost:5000/title/{imdbId}
