// The city — every fact that makes this calendar Miami's rather than another
// town's, in one place (2026-10-12: the sixteenth city on lqa-events, after
// Everett, Chicago, the 2026-10-11 batch and Las Vegas). The browser
// (filter.js, app.js) and the build (scripts/*.mjs) both read it; nothing
// else names a venue or a team. The shared files (app.js, filter.js,
// styles.css bar its --v-* hues, scripts/*.mjs bar fetch-events.mjs and
// sources.mjs) are lqa-events' own, byte for byte — see README "Sister sites".
//
// Loaded before filter.js (a plain script, so the tests can share it): it
// sets globalThis.LQACity (the name is the shared code's, not the city's).
(function (global) {
  'use strict';

  // The home teams, matched on the event title whatever the venue. Order =
  // the Teams strip, left to right; the first match wins (app.js teamFor),
  // so the Hurricanes' football pattern steps aside for a basketball title
  // and "Florida Panthers" never catches FIU's "Florida International
  // Panthers" (each pattern names its own club in full).
  // Per team:
  //   re        the title match
  //   venue     the home building; schedule = the club's own schedule page
  //   sport     keys the strip icon (app.js SPORT_ICONS), the game clock,
  //             the leader categories
  //   colors    [primary, accent] — the season calendar's home cells and
  //             card frames
  //   espn      ESPN's sport/league/team id — every club here is on ESPN
  //             (season, form, news) except that the Panthers' season comes
  //             from the NHL's own api-web feed (season kind 'nhl', as
  //             Chicago's Blackhawks) and the Marlins' from MLB's stats API
  //             (first-pitch times and the standings)
  //   inject    a club whose home dates no ticket feed lists: the league's
  //             schedule puts them on the calendar under this ticket link
  //   club      the club's name on Ticketmaster; news the outlets' feeds;
  //             wiki the article (teamPage: college seasons are titled
  //             "2026 Miami Hurricanes football team"); opens when the
  //             season usually starts
  var TEAMS = [
    // Miami Heat, NBA, Kaseya Center — Ticketmaster lists the home games
    { slug: 'heat', label: 'Heat', re: /\bheat\b/i, sport: 'basketball', venue: 'Kaseya Center', colors: ['#98002e', '#f9a01b'],
      espn: { sport: 'basketball', league: 'nba', id: '14' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nba/500/mia.png', schedule: 'https://www.nba.com/heat/schedule',
      club: 'Miami Heat', opens: 'late October', wiki: { title: 'Miami Heat' } },
    // Miami Dolphins, NFL, Hard Rock Stadium — Ticketmaster lists the home games
    // ("Miami Dolphins" in full: the Jacksonville Dolphins visit the Watsco Center)
    { slug: 'dolphins', label: 'Dolphins', re: /miami dolphins/i, sport: 'football', venue: 'Hard Rock Stadium', colors: ['#008e97', '#fc4c02'],
      espn: { sport: 'football', league: 'nfl', id: '15' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png', schedule: 'https://www.miamidolphins.com/schedule/',
      club: 'Miami Dolphins', opens: 'September', wiki: { title: 'Miami Dolphins', startYear: true },
      news: [['https://www.miamidolphins.com/rss/news', 'MiamiDolphins.com']] },
    // Miami Marlins, MLB, loanDepot park — Ticketmaster lists the home games
    { slug: 'marlins', label: 'Marlins', name: 'Miami Marlins', abbr: 'MIA', re: /\bmarlins\b/i, sport: 'baseball', venue: 'loanDepot park', colors: ['#00a3e0', '#ef3340'],
      espn: { sport: 'baseball', league: 'mlb', id: '28' }, season: { kind: 'mlb', id: 146 }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/mia.png', schedule: 'https://www.mlb.com/marlins/schedule',
      club: 'Miami Marlins', opens: 'late March', wiki: { title: 'Miami Marlins' },
      news: [['https://www.mlb.com/marlins/feeds/news/rss.xml', 'MLB.com']] },
    // Florida Panthers, NHL, Amerant Bank Arena in Sunrise — Ticketmaster lists the home games
    { slug: 'panthers', label: 'Panthers', name: 'Florida Panthers', abbr: 'FLA', re: /florida panthers/i, sport: 'hockey', venue: 'Amerant Bank Arena', colors: ['#c8102e', '#041e42'],
      espn: { sport: 'hockey', league: 'nhl', id: '26' }, season: { kind: 'nhl', abbrev: 'FLA' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/fla.png', schedule: 'https://www.nhl.com/panthers/schedule',
      club: 'Florida Panthers', opens: 'early October', wiki: { title: 'Florida Panthers' } },
    // Inter Miami CF, MLS, NU Stadium at Miami Freedom Park (the club's new
    // home from 2026; Chase Stadium in Fort Lauderdale keeps the academy and
    // the Messi Cup) — the club sells its own league tickets, so Ticketmaster
    // lists only the odd friendly: the schedule is injected
    { slug: 'intermiami', label: 'Inter Miami', name: 'Inter Miami CF', abbr: 'MIA', re: /inter miami/i, sport: 'soccer', venue: 'NU Stadium', colors: ['#f7b5cd', '#231f20'],
      espn: { sport: 'soccer', league: 'usa.1', id: '20232' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://www.intermiamicf.com/tickets/' },
      logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/20232.png', schedule: 'https://www.intermiamicf.com/schedule/',
      club: 'Inter Miami CF', opens: 'late February', wiki: { title: 'Inter Miami CF' } },
    // Miami Hurricanes football, ACC, Hard Rock Stadium — Ticketmaster lists the home Saturdays
    { slug: 'hurricanes', label: 'Hurricanes', name: 'Miami Hurricanes', abbr: 'MIA', re: /miami hurricanes(?!.*(basketball|baseball|volleyball|soccer))|hurricanes football/i, sport: 'football', venue: 'Hard Rock Stadium', colors: ['#f47321', '#005030'],
      espn: { sport: 'football', league: 'college-football', id: '2390' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png', schedule: 'https://miamihurricanes.com/sports/football/schedule',
      club: 'Miami Hurricanes Football', opens: 'late August', wiki: { title: 'Miami Hurricanes football', teamPage: true } },
    // Miami Hurricanes men's basketball, ACC, Watsco Center in Coral Gables —
    // the Watsco listing carries the women's games and the concerts, not the
    // men's, so the schedule is injected
    { slug: 'hurricanesbasketball', label: 'Hurricanes Basketball', name: 'Miami Hurricanes', abbr: 'MIA', re: /hurricanes (men'?s )?basketball/i, sport: 'basketball', venue: 'Watsco Center', colors: ['#005030', '#f47321'],
      espn: { sport: 'basketball', league: 'mens-college-basketball', id: '2390' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      inject: { url: 'https://miamihurricanes.com/sports/mbball/schedule', name: "Miami Hurricanes Men's Basketball" }, // the injected titles say which program, since the football pattern owns "Miami Hurricanes vs …" (Hard Rock Stadium's Ticketmaster titles)
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2390.png', schedule: 'https://miamihurricanes.com/sports/mens-basketball/schedule',
      club: "Miami Hurricanes Men's Basketball", opens: 'early November', wiki: { title: "Miami Hurricanes men's basketball", teamPage: true } },
    // FIU Panthers football, Conference USA, Pitbull Stadium — Ticketmaster lists the home games
    { slug: 'fiu', label: 'FIU Panthers', name: 'FIU Panthers', abbr: 'FIU', re: /florida international|\bfiu\b/i, sport: 'football', venue: 'Pitbull Stadium', colors: ['#081e3f', '#b6862c'],
      espn: { sport: 'football', league: 'college-football', id: '2229' }, season: { kind: 'espn' }, form: { kind: 'espn' },
      logo: 'https://a.espncdn.com/i/teamlogos/ncaa/500/2229.png', schedule: 'https://fiusports.com/sports/football/schedule',
      club: 'FIU Panthers Football', opens: 'late August', wiki: { title: 'FIU Panthers football', teamPage: true } },
  ];

  // The venues, one record each — Miami's stadium, arenas and halls first by
  // size, then Broward County and beyond. Per venue:
  //   capacity how many people the place holds
  //   area     'town' for the places outside Miami-Dade — Sunrise,
  //            Hollywood, Fort Lauderdale, Pompano Beach (the panel's second
  //            group); absent = Miami, Miami Beach, Coral Gables, Miami Gardens
  //   type     the event type when the title decides nothing
  //   cssVar   the hue styles.css sets for it (dark block --v-*); color
  //            the same hue as a value, for the series graph
  //   url      the venue's own events listing — not a ticket vendor
  //   icon     a mark for listings without a team crest
  //   tm       its Ticketmaster Discovery listing (fetch-events.mjs reads
  //            the venue by id — every page; a hall with several rooms on
  //            Ticketmaster lists them all, comma-joined, and `match` folds
  //            them to the one name). There is NO city sweep here, as in
  //            Las Vegas: the rooms are read one by one. exclude drops the
  //            suite, parking, tour and hotel-package rows the stadiums
  //            list beside their games ("stadium tour", never a concert's
  //            "World Tour")
  //   alias    the other spellings the feeds use for it, folded to this name
  // No festivals yet, so the panel's Festivals group folds away (app.js).
  var VENUES = {
    // --- Miami: Hard Rock Stadium, Kaseya Center, loanDepot park, NU Stadium, the Arsht Center, Bayfront Park, the Knight Center, the Fillmore, the Watsco Center, Pitbull Stadium ---
    'Hard Rock Stadium': {
      geo: [25.95793, -80.23887],
      capacity: 65326,
      type: 'sports',
      cssVar: '--v-hardrock',
      color: '#ea8686',
      url: 'https://www.hardrockstadium.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.hardrockstadium.com&sz=128',
      tm: { id: 'KovZpZAEkvtA', match: 'hard rock stadium', fallbackUrl: 'https://www.hardrockstadium.com/events/', exclude: /luxury & suites|suite|parking|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?|hotel package|tailgate/i },
      // the stadium's own page: the games are Ticketmaster's rows (and the Teams schedules), so a card's category
      // class stands in for its venue name (`item` is a lookahead so the split keeps it) and `venues` keeps the rest — the Grand Prix,
      // the Orange Bowl, the Dolphins Cancer Challenge; the concert and Miami Open cards print a date span and no clock, and Ticketmaster
      // carries every show and every session, so they are left to it too
      feed: { kind: 'cards', url: 'https://www.hardrockstadium.com/events/', secondary: true,
        item: /(?=<div class="fusion-layout-column[^"]*\bevent-card\b)/, title: /href="([^"]+)"[\s\S]*?<h6[^>]*>(?:<[^>]+>\s*)*([^<]+)</, when: /class="fusion-text[^"]*"[^>]*>\s*(?:<[^>]+>\s*)*([^<]+)</, place: /\bevent-card ([a-z-]+)/, venues: /^(?!(?:um|dolphins)-game$|concert$|miami-open$)/ },
      alias: /hard rock stadium/i,
    },
    'Kaseya Center': {
      geo: [25.78123, -80.1878],
      capacity: 19600,
      type: 'sports',
      cssVar: '--v-kaseya',
      color: '#86eaa3',
      url: 'https://www.kaseyacenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.kaseyacenter.com&sz=128',
      tm: { id: 'KovZpZAJtFaA', match: 'kaseya', fallbackUrl: 'https://www.kaseyacenter.com/events', exclude: /parking|suite|hotel package|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?/i },
      feed: { kind: 'rss', url: 'https://www.kaseyacenter.com/events/rss', secondary: true, drop: /all-access tour|parking|suite/i }, // the arena's own listing (carbonhouse)
      alias: /kaseya center|ftx arena|americanairlines arena/i,
    },
    'loanDepot park': {
      geo: [25.77805, -80.21972],
      capacity: 37000,
      type: 'sports',
      cssVar: '--v-loandepot',
      color: '#c086ea',
      url: 'https://www.mlb.com/marlins/ballpark/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.mlb.com&sz=128',
      tm: { id: 'KovZpZAId1JA', match: 'loandepot', fallbackUrl: 'https://www.mlb.com/marlins/ballpark/events', exclude: /parking|suite|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?|hotel package/i },
      alias: /loandepot park|marlins park/i,
    },
    'NU Stadium': {
      geo: [25.79268, -80.25941],
      capacity: 25000,
      type: 'sports',
      cssVar: '--v-nustadium',
      color: '#86b7ea',
      url: 'https://www.intermiamicf.com/nu-stadium/',
      icon: 'https://www.google.com/s2/favicons?domain=www.intermiamicf.com&sz=128',
      tm: { id: 'KovZ917AYfq', match: 'nu stadium', fallbackUrl: 'https://www.intermiamicf.com/nu-stadium/', exclude: /parking|suite|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?|hotel package/i },
      // the stadium's own listing, server-rendered from its Ticketmaster block: "WED, OCT 28 | 7:30 PM EDT" and the name
      feed: { kind: 'cards', url: 'https://nustadium.com/events/', secondary: true,
        item: /<article class="uv-ticketmaster-event"/, title: /(?=[\s\S]*?href="([^"]+)")[\s\S]*?uv-ticketmaster-event__name">([^<]+)</, when: /uv-ticketmaster-event__date">([^<]+)</ },
      alias: /nu stadium|miami freedom park/i,
    },
    'Adrienne Arsht Center': {
      geo: [25.7849, -80.1896],
      capacity: 2400,
      type: 'arts',
      cssVar: '--v-arsht',
      color: '#eadd86',
      url: 'https://www.arshtcenter.org/calendar/',
      icon: 'https://www.google.com/s2/favicons?domain=www.arshtcenter.org&sz=128',
      tm: { id: 'Z7r9jZa7H8,KovZpa4RIe,KovZpZAaIvvA', match: 'arsht', fallbackUrl: 'https://www.arshtcenter.org/calendar/', exclude: /parking|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?/i }, // the Knight Concert Hall, the Ziff Ballet Opera House and the center's own listing
      alias: /arsht center|knight concert hall|ziff ballet opera house/i,
    },
    'FPL Solar Amphitheater': {
      geo: [25.77622, -80.18602],
      capacity: 10000,
      type: 'concert',
      cssVar: '--v-bayfront',
      color: '#86d9ea',
      url: 'https://www.bayfrontparkmiami.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=www.bayfrontparkmiami.com&sz=128',
      tm: { id: 'KovZpZAEAFAA', match: 'bayfront', fallbackUrl: 'https://www.bayfrontparkmiami.com/events/', exclude: /parking|vip (add-on|upgrade|package)/i },
      feed: { kind: 'squarespace', url: 'https://www.bayfrontparkmiami.com/events/', secondary: true, venues: /fpl|bayfront park/i }, // the park trust's Squarespace calendar; its Maurice A. Ferré Park rows are another park's
      alias: /fpl solar amphitheater|bayfront park/i,
    },
    'James L. Knight Center': {
      geo: [25.77078, -80.19012],
      capacity: 4600,
      type: 'concert',
      cssVar: '--v-knight',
      color: '#ea86bc',
      url: 'https://jlkc.com/events/',
      icon: 'https://www.google.com/s2/favicons?domain=jlkc.com&sz=128',
      tm: { id: 'KovZpZAJvnAA', match: 'knight center', fallbackUrl: 'https://jlkc.com/events/', exclude: /parking|vip (add-on|upgrade|package)/i },
      feed: { kind: 'tribe', url: 'https://jlkc.com/wp-json/tribe/events/v1/events', secondary: true }, // the center's WordPress calendar
      alias: /knight center/i,
    },
    'The Fillmore Miami Beach': {
      geo: [25.79292, -80.13314],
      capacity: 2700,
      type: 'concert',
      cssVar: '--v-fillmore',
      color: '#9fea86',
      url: 'https://www.fillmoremb.com/',
      icon: 'https://www.google.com/s2/favicons?domain=www.fillmoremb.com&sz=128',
      tm: { id: 'KovZpZAEkedA', match: 'fillmore', fallbackUrl: 'https://www.fillmoremb.com/', exclude: /parking|vip (add-on|upgrade|package)/i },
      alias: /fillmore miami beach|jackie gleason theater/i,
    },
    'Watsco Center': {
      geo: [25.71508, -80.27918],
      capacity: 8000,
      type: 'concert',
      cssVar: '--v-watsco',
      color: '#8a86ea',
      url: 'https://www.watscocenter.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.watscocenter.com&sz=128',
      tm: { id: 'KovZpZAEkAdA', match: 'watsco', fallbackUrl: 'https://www.watscocenter.com/events', exclude: /parking|suite/i },
      feed: { kind: 'rss', url: 'https://www.watscocenter.com/events/rss', secondary: true, drop: /parking|suite/i }, // the arena's own listing (carbonhouse)
      alias: /watsco center|bankunited center/i,
    },
    'Pitbull Stadium': {
      geo: [25.75254, -80.37801],
      capacity: 20000,
      type: 'sports',
      cssVar: '--v-pitbull',
      color: '#eaa786',
      url: 'https://fiusports.com/sports/football/schedule',
      icon: 'https://www.google.com/s2/favicons?domain=fiusports.com&sz=128',
      tm: { id: 'KovZpZAJtF1A', match: 'pitbull', fallbackUrl: 'https://fiusports.com/sports/football/schedule', exclude: /parking|suite|tailgate/i },
      // FIU's Sidearm calendar, the stadium's dates only; the result tag and the promo suffix come off the title ("[W] FIU Football vs X - Homecoming")
      feed: { kind: 'icsfile', url: 'https://fiusports.com/calendar.ics', secondary: true, venues: /pitbull stadium/i, rename: [[/^\[[A-Z]\]\s*/, ''], [/\s+(?:-|–|--)\s+.*$/, '']] },
      alias: /pitbull stadium|fiu stadium|riccardo silva stadium/i,
    },
    // --- Broward & beyond (`area: 'town'`): Sunrise's arena, Hollywood's Hard Rock, Fort Lauderdale's Broward Center and Revolution Live, Pompano Beach's amphitheater ---
    'Amerant Bank Arena': {
      geo: [26.15536, -80.33023],
      area: 'town',
      capacity: 19250,
      type: 'sports',
      cssVar: '--v-amerant',
      color: '#86eac4',
      url: 'https://www.amerantbankarena.com/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.amerantbankarena.com&sz=128',
      tm: { id: 'KovZpZAEeavA', match: 'amerant', fallbackUrl: 'https://www.amerantbankarena.com/events', exclude: /parking|suite|hotel package|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?/i },
      feed: { kind: 'rss', url: 'https://www.amerantbankarena.com/events/rss', secondary: true, drop: /parking|suite|hotel package|arena tours?|\b[a-z]{3} vs fla\b/i }, // the arena's own listing (carbonhouse); the Panthers' games ("DET vs FLA", a theme night in front) are the NHL schedule's rows
      alias: /amerant bank arena|fla live arena|bb&t center/i,
    },
    'Hard Rock Live': {
      geo: [26.05034, -80.21096],
      area: 'town',
      capacity: 7000,
      type: 'concert',
      cssVar: '--v-hardrocklive',
      color: '#e186ea',
      url: 'https://casino.hardrock.com/hollywood/entertainment/hard-rock-live',
      icon: 'https://www.google.com/s2/favicons?domain=casino.hardrock.com&sz=128',
      tm: { id: 'KovZpZA6AEaA', match: 'hard rock live', fallbackUrl: 'https://casino.hardrock.com/hollywood/entertainment/hard-rock-live', exclude: /parking|hotel package|vip (add-on|upgrade|package)/i },
      // the casino's Sitecore search answers the whole upcoming list as JSON-wrapped cards (the page itself renders a
      // carousel of the first few); `venues` keeps Hard Rock Live's out of the pool parties; the card prints no year
      feed: { kind: 'cards', secondary: true,
        url: 'https://casino.hardrock.com/en/hollywood/sxa/search/results/?s=%7B97C57FBA-7374-4444-8C49-E4ADA1F1452C%7D&itemid=%7BB0BA3C4E-ED00-40D7-8B2D-C1C347DCC93A%7D&sig=upcomingevents&autoFireSearch=true&v=%7BEE158909-BE75-43B7-B2DC-4D16E047CCE8%7D&p=100&e=0&l=en&z=0',
        item: /ccard jsCard eventCard/, title: /(?=[\s\S]*?ccard--event__btn-buy[^>]*?href=\\"([^"\\]+))[\s\S]*?ccard--event__title[^>]*>([^<]*)/, when: /ccard--event__time__wrap\\">(?:\\r\\n|\s)*([^<\\]+)/, place: /ccard--event__venue\\">([^<]*)/, venues: /hard rock live/i },
      alias: /hard rock live/i,
    },
    'Broward Center': {
      geo: [26.1193, -80.14943],
      area: 'town',
      capacity: 2700,
      type: 'arts',
      cssVar: '--v-broward',
      color: '#d5ea86',
      url: 'https://www.browardcenter.org/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.browardcenter.org&sz=128',
      tm: { id: 'KovZpZA7AeJA,KovZpZAEvnlA,KovZpZAEeadA', match: 'broward center', fallbackUrl: 'https://www.browardcenter.org/events', exclude: /parking|^(stadium|arena|ballpark|venue) tours?\b|behind.the.scenes tours?/i }, // the Au-Rene Theater, the Amaturo Theater and the center's own listing
      feed: { kind: 'rss', url: 'https://www.browardcenter.org/events/rss', secondary: true, venues: /broward center/i, drop: /parking|backstage tours?|building tours?/i }, // the center's own listing (carbonhouse) carries the Parker, the Miniaci and Aventura too
      alias: /broward center|au-rene theater|amaturo theater/i,
    },
    'Revolution Live': {
      geo: [26.12109, -80.14616],
      area: 'town',
      capacity: 1300,
      type: 'concert',
      cssVar: '--v-revolution',
      color: '#ea869a',
      url: 'https://www.jointherevolution.net/events',
      icon: 'https://www.google.com/s2/favicons?domain=www.jointherevolution.net&sz=128',
      tm: { id: 'KovZpZAEkvlA,KovZpZAEke6A', match: 'revolution live', fallbackUrl: 'https://www.jointherevolution.net/events', exclude: /parking|vip (add-on|upgrade|package)/i }, // the club and its outdoor stage
      // the club's home page is its listing (/events/ is an empty page); the clock it prints is the doors time
      feed: { kind: 'cards', url: 'https://www.jointherevolution.net/', secondary: true,
        item: /<div class="event-list__list-item/, title: /<a href="([^"]+)" class="event-list__title-link">[\s\S]*?<h2 class="event-list__title">([^<]+)</, when: /start-month">([^<]*)<[\s\S]*?start-date">([^<]*)<[\s\S]*?start-date">([^<]*)<(?:[\s\S]*?event-list__time">([^<]*)<)?/ },
      alias: /revolution live/i,
    },
    'Pompano Beach Amphitheater': {
      geo: [26.24001, -80.1059],
      area: 'town',
      capacity: 3000,
      type: 'concert',
      cssVar: '--v-pompano',
      color: '#86ea8e',
      url: 'https://www.pompanobeacharts.org/pompano-beach-amphitheater',
      icon: 'https://www.google.com/s2/favicons?domain=www.pompanobeacharts.org&sz=128',
      tm: { id: 'KovZpZA7AlnA', match: 'pompano', fallbackUrl: 'https://www.pompanobeacharts.org/pompano-beach-amphitheater', exclude: /parking|vip (add-on|upgrade|package)/i },
      // the city's arts calendar, every venue on one page; a card prints the date without a year and the clock inside
      // its blurb ("Doors open at 6:30PM", or "Show: 8:00 PM" — the show's when it says so)
      feed: { kind: 'cards', url: 'https://www.pompanobeacharts.org/events', secondary: true, drop: /about the amp/i,
        item: /<div class="col-xl-2 col-lg-3 col-sm-6 /, title: /href="([^"]+)" class="event-box[^"]*">[\s\S]*?event-title">([^<]*)</, when: /(?=[\s\S]*?event-date">\s*([^<]*?)\s*<)[\s\S]*?event-text">\s*(?:[^<]*?Show:?\s*(\d{1,2}(?::\d{2})?\s*[AP]\.?M)|[^<]*?(\d{1,2}(?::\d{2})?\s*[AP]\.?M))?/, place: /event-location">\s*([^<]*?)\s*</, venues: /amphitheater|the amp/i },
      alias: /pompano beach amphitheat(er|re)/i,
    },
  };

  // The usual view: every room on — nothing here lists nightly bar programs
  var DEFAULT_ON = ['Hard Rock Stadium', 'Kaseya Center', 'loanDepot park', 'NU Stadium', 'Adrienne Arsht Center', 'FPL Solar Amphitheater', 'James L. Knight Center', 'The Fillmore Miami Beach', 'Watsco Center', 'Pitbull Stadium', 'Amerant Bank Arena', 'Hard Rock Live', 'Broward Center', 'Chase Stadium', 'Revolution Live', 'Pompano Beach Amphitheater'];
  var DEFAULT_OFF = [];
  var PREFS_KNOWN_FROM = null; // no default-off venue yet, so nothing for saved prefs to be told about

  // Event types: every event lands in exactly one, from its flags, title,
  // then venue. The rows the panel shows, in order.
  var TYPES = [
    { key: 'concert', label: 'Concerts', title: 'Live music — the arena tours, the amphitheaters, the Fillmore, Hard Rock Live and the clubs' },
    { key: 'sports', label: 'Sports', title: 'Heat, Dolphins, Marlins, Panthers, Inter Miami, Hurricanes and FIU home games, the Miami Open, the Orange Bowl, fights and wrestling' },
    { key: 'arts', label: 'Arts & Theater', title: 'The Arsht Center, the Broward Center, Miami City Ballet, touring musicals, comedy, dance' },
    { key: 'community', label: 'Community', title: 'Festivals, family days, Bayfront Park' },
  ];
  var MOVIE_VENUE = null; // no cinema here

  // Share codes (?f=CODE): REGISTRY is every filterable key in a fixed
  // order and a code is a bitmask over it, so the list is APPEND-ONLY —
  // adding an entry adds a bit and every existing code keeps meaning what
  // it meant; removing or reordering one changes every link out there.
  // 31 slots from the first build: 6 base-36 digits.
  var CODE_LENGTH = 6;
  var REGISTRY = [
    ['venue', 'Hard Rock Stadium'], ['venue', 'Kaseya Center'], ['venue', 'loanDepot park'], ['venue', 'NU Stadium'], ['venue', 'Adrienne Arsht Center'], ['venue', 'FPL Solar Amphitheater'], ['venue', 'James L. Knight Center'], ['venue', 'The Fillmore Miami Beach'], ['venue', 'Watsco Center'], ['venue', 'Pitbull Stadium'], ['venue', 'Amerant Bank Arena'], ['venue', 'Hard Rock Live'], ['venue', 'Broward Center'], ['venue', 'Revolution Live'], ['venue', 'Pompano Beach Amphitheater'],
    ['badge', 'concert'], ['badge', 'sports'], ['badge', 'arts'], ['badge', 'community'],
    ['team', 'heat'], ['team', 'dolphins'], ['team', 'marlins'], ['team', 'panthers'], ['team', 'intermiami'], ['team', 'hurricanes'], ['team', 'hurricanesbasketball'], ['team', 'fiu'],
    ['cap', 'stadium'], ['cap', 'arena'], ['cap', 'hall'], ['cap', 'room'],
  ];

  // The words the page uses for the place
  var WORDS = {
    teamCity: 'Miami', // the board drops it from the clubs' names ("Miami Heat" → Heat; the Panthers, Inter Miami and FIU keep theirs)
    presetDefault: 'Every venue — Hard Rock Stadium, the arenas, the ballpark, the halls in Miami and the venues in Broward — every team and type',
    presetNeighborhood: 'Miami only',
    presetBig: 'Only the places that hold 2,000 or more — the stadiums, the arenas, the ballpark, the amphitheaters and the halls',
    phrases: { all: 'Showing everything.', none: 'Showing nothing yet — open Filter and pick some venues.', neighborhood: 'Showing Miami only.', big: 'Showing the big venues only — the stadiums, the arenas, the ballpark, the amphitheaters and the halls.' },
  };

  global.LQACity = {
    key: 'miami',
    name: 'Miami',
    site: 'https://miami.here.events/',
    userAgent: 'Mozilla/5.0 (compatible; miami-events/1.0; +https://miami.here.events/)',
    tz: 'America/New_York', tzName: 'Eastern', // the city's time zone: the ICS feed's TZID, the game clocks, the poster's footer
    state: "Florida", stateOutline: 'M2.3 5.0L2.5 4.7L2.5 4.1L2.0 3.4L3.7 3.1L6.3 3.1L8.9 3.1L9.2 4.0L10.3 4.1L11.6 4.1L12.8 4.2L14.1 4.3L15.3 4.4L16.2 4.6L16.3 5.0L16.7 4.9L16.7 4.2L16.9 3.8L17.1 3.7L18.3 4.2L18.8 6.8L20.6 10.5L20.6 11.1L20.7 12.0L20.5 11.7L20.4 10.6L20.3 11.2L20.3 10.5L20.0 10.1L19.9 9.9L20.1 11.1L21.5 14.6L22.0 15.8L21.8 18.7L21.7 18.6L21.2 20.0L20.6 20.6L19.4 20.9L19.0 20.4L19.6 20.6L19.3 20.2L18.6 19.1L17.6 18.3L17.0 16.8L17.3 16.2L16.9 16.6L16.6 16.1L16.6 15.3L16.3 15.7L15.9 15.4L15.1 13.9L15.1 13.6L15.8 12.7L15.5 12.6L15.1 12.3L15.2 12.6L15.1 13.1L14.8 13.0L14.8 11.5L15.1 9.8L13.4 7.8L10.7 6.0L10.6 6.4L10.1 6.5L9.0 6.9L8.0 7.1L7.8 6.6L8.1 6.9L7.6 6.2L7.3 5.7L7.3 5.3L6.9 5.6L6.6 5.5L5.6 4.9L5.8 4.8L5.1 4.7L4.5 5.0L3.2 5.0L3.7 4.7L3.4 4.7L3.1 4.8L2.3 5.3L2.4 5.0Z', // the masthead's small state, linking to here.events (scripts/state-outline.mjs, Natural Earth 1:50m)
    // the calendar feed's header; the UID domain never changes (changing it
    // re-creates every event in subscribers' calendars)
    ics: { name: 'Miami Events', short: 'Miami Events', teams: 'Miami home teams — every season', prodid: '-//here.events//miami-events//EN', uidDomain: 'fosdal.net', // the UID domain the whole family issues (the shared ics test pins it)
      desc: 'Upcoming events around Miami\\, FL — Hard Rock Stadium\\, Kaseya Center\\, loanDepot park\\, NU Stadium\\, the Arsht Center and the rooms from Miami Beach to Fort Lauderdale' },
    teams: TEAMS,
    map: { // the Map view (local-map.js; the ground drawn once by scripts/build-local-map.mjs from OpenStreetMap, committed as site/local-map.json) — every city gets one, Steve, 2026-10-26
      kind: 'urban',
      bbox: [25.636, -80.419, 26.319, -80.065], // south, west, north, east — every room, with a margin
      home: [25.696, -80.316, 25.812, -80.097], // the view at first: the city's own rooms; the fit button shows the whole frame
      roads: ['motorway', 'trunk', 'primary'],
      tolerance: 0.8,
      labels: [
        { name: 'Miami', lat: 25.775, lon: -80.194, anchor: 'middle' },
        { name: 'Miami Beach', lat: 25.79292, lon: -80.1353, anchor: 'middle' },
        { name: 'Coral Gables', lat: 25.73311, lon: -80.25851, anchor: 'middle' },
        { name: 'Sunrise', lat: 26.16669, lon: -80.27876, anchor: 'middle' },
        { name: 'Hollywood', lat: 26.0112, lon: -80.14949, anchor: 'middle' },
        { name: 'Pompano Beach', lat: 26.23786, lon: -80.12477, anchor: 'middle' },
      ],
    },
    venues: VENUES,
    defaultOn: DEFAULT_ON,
    defaultOff: DEFAULT_OFF,
    prefsKnownFrom: PREFS_KNOWN_FROM,
    types: TYPES,
    movieVenue: MOVIE_VENUE,
    groundsVenue: null, // every listing is read by room, so nothing arrives under a name city.js lacks
    codeLength: CODE_LENGTH,
    registry: REGISTRY,
    words: WORDS,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
