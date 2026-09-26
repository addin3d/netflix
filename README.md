
# AddinFlix

## Release Snapshot (March 2026)

- Status: Active
- Type: Static streaming-style web app
- Live demo: https://flix.addin3d.com
- CI checks: JavaScript syntax + static file integrity

## Demo Card

Watch all your favourite movies, web series, TV shows and anime for free. 

## Demo

https://flix.addin3d.com

## GIF

## Run Locally

Clone the project

```bash
  Download the project files from the site deployment.
```

Open the project directory and run `index.html`.

## TMDB Proxy Configuration

Deploy this site with Cloudflare Pages Functions and configure one server-side secret:

- `TMDB_ACCESS_TOKEN`: TMDB API Read Access Token, recommended.
- `TMDB_API_KEY`: TMDB API key, supported as an alternative.

The browser calls `/api/tmdb/*`; credentials are read only by `functions/api/tmdb/[[path]].js` and are never sent in frontend JavaScript.


## Features

- Watch any movie, webseries, TV show or anime for free.
- **Url Sharing**  
    Despite of being a single page website built wihout any framework, you can still share url's of movies and other shows.
- Ultra fast loading.
- Single page website.




## Acknowledgements

- [Pace.js](https://codebyzach.github.io/pace/e.com/project/elangosundar/awesome-README-templates)
- IMDB
- TMDB
- Smashy Stream

## Contributing

Contributions are always welcome!  
If you have any new Idea or have found a bug, please don't hesitate to open a Pull Request.


## Support
For support, use the contact page on the site.
