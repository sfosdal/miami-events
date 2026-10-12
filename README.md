# Miami Events

Event feed and calendar for Miami: Hard Rock Stadium, Kaseya Center,
loanDepot park, NU Stadium, the Adrienne Arsht Center, Bayfront Park's
amphitheater, the James L. Knight Center, the Fillmore Miami Beach, the
Watsco Center and Pitbull Stadium, and in Broward County Amerant Bank Arena,
Hard Rock Live, the Broward Center, Revolution Live and the Pompano Beach
Amphitheater — with the home teams' seasons (Heat, Dolphins, Marlins,
Panthers, Inter Miami, Hurricanes football and basketball, FIU football) in a
Teams view.

Live at **https://miami.here.events/** once the domain is wired (GitHub Pages,
built by the Actions workflow once a day at noon Eastern).

A city on the lqa-events codebase, after Everett, Chicago, the 2026-10-11
batch and Las Vegas: everything that makes this Miami's is `site/city.js`
(every team, venue, type, default, share-code registry and string),
`site/index.html`, `scripts/fetch-events.mjs` (the sources), `site/embed.js`,
`outlook.json`, `scripts/data/postseason.json`, `channels.json`, the manifest
and icons (a sunset over the bay with a palm, rendered from `favicon.svg`).
Everything else is lqa-events' own, byte for byte — copy from there, never
edit here.

## Embed

```html
<div id="miami-events"></div>
<script src="https://miami.here.events/embed.js" data-max="8" defer></script>
```

## Sources

- **Ticketmaster Discovery API** — every room by its venue id (every page,
  one call a second): 15 rooms, from Hard Rock Stadium to the 1,300-seat
  Revolution Live; a hall with several rooms on Ticketmaster (the Arsht
  Center, the Broward Center, Revolution Live) is read as one comma-joined
  id list. There is no city sweep. The suite, parking, tour and
  hotel-package rows are dropped per room (`tm.exclude`). Church events are
  left out (`isChurch`).
- **Seasons** — the NHL's own api-web feed for the Panthers; ESPN for the
  Heat, the Dolphins, Inter Miami, both Hurricanes programs and FIU; MLB's
  stats API for the Marlins (`scripts/schedules.mjs`, shared with lqa).
  Inter Miami sells its own league tickets and the Watsco Center's listing
  carries no men's basketball, so those two clubs' home dates are injected
  from the league schedules (city.js `inject`).

Next to add: the rooms whose shows Ticketmaster never lists (the New World
Center, the Olympia Theater, the Miami Beach Bandshell, the Wynwood and
downtown clubs), the Kravis Center in West Palm Beach, and the Miami Open's
and Ultra's own listings.

## Local run

```sh
cp .env.example .env   # TICKETMASTER_API_KEY=…
ALLOW_NO_ARCHIVE=1 node scripts/fetch-events.mjs   # ALLOW_NO_ARCHIVE only until the site has published once
node --test scripts/*.test.mjs
```
