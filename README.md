# HentaiEra scraper for Localnet

Reads `hentaiera.com` pages for Localnet, a browser extension that is a personal search engine.
Localnet pulls it from here the first time it scrapes such a page, through the
[localnet-scrapers](https://github.com/opowell/localnet-scrapers) scraper source.

A gallery's page (/gallery/1771376/) reads as its title, its original title where it has one, then each of its pages as a picture (see hentaieraPages). Its details are what it is filed under (tags, artists, groups, parodies, characters, languages and category), each a link to its listing, which it links to with weight 0.5, its artists' and groups' with weight 1; and it links to the galleries the page offers as like it by their place. Any other page (the home page, a tag, an artist, a search) is a listing of the galleries it shows.

- `source.json`: what Localnet reads to know the scraper: its name, the URLs it reads, how the site is searched, and the file to run.
- `hentaiera.js`: the parser. It is injected into the scraped page after Localnet's DOM helpers (content-scripts/utils/dom.js) and defines `window.__dynamicParser`.
- `hentaiera.test.ts`: its unit tests, run from a Localnet checkout (`pnpm parsers pull`, then `pnpm test parsers/localnet-scraper-hentaiera`).
- `saved-pages/` (not in git): real pages saved from the site, which Localnet's `e2e/saved-pages.test.ts` scrapes. See Localnet's README.