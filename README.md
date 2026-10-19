# Anonymous Pokémon in Google Docs

A Tampermonkey userscript that turns Google Docs / Sheets / Slides **anonymous animals** into Pokémon.

*Anonymous Goose* becomes *Anonymous Swanna*, *Anonymous Hamster* becomes *Anonymous Pikachu*, and the avatar icon is swapped for the Pokémon's sprite.

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/).
2. Open [`gdocs-anonymous-pokemon.user.js`](gdocs-anonymous-pokemon.user.js) (the **Raw** button on GitHub). Tampermonkey will offer to install it.
3. Open any Google Doc that anonymous viewers are looking at.

## What it changes

- **Avatars**: any image or background that points at `ssl.gstatic.com/docs/common/profile/<animal>_lg.png` is replaced with the matching Shuffle sprite.
- **Avatar colour**: Google gives each anonymous viewer a random circle colour. The script recolours it by the Pokémon's primary type (Swanna on water blue rather than a misleading green). Set `BACKGROUND = 'google'` to keep Google's colour, or give one Pokémon its own with `color: '#8d6e63'` in `ANIMALS`.
- **Names**: "Anonymous &lt;Animal&gt;" in tooltips, cursor flags, the viewer list and menus. Text inside the document itself is never touched.
- **Any language**: the script reads each viewer's display name off their avatar, so translated names work too ("Anonymer Ameisenbär" becomes "Anonymer Heatmor").
- **New animals**: if Google adds an animal that isn't mapped yet, it still gets a Pokémon, picked consistently from the existing map.
- **Art credit links**: **Ctrl/Shift+click** (Cmd+click on Mac) a Pokémon avatar to open where its art came from: The Spriters Resource for the Shuffle icons, or PokeAPI for a fallback. Hold Ctrl or Shift while hovering to see the link. A plain click still does what Google normally does.

Everything runs locally in your browser and only changes what you see.

## Sprites

Avatars use Pokémon Shuffle icons (gen 1–7) from these sources:

1. **The [`sprites/`](sprites) folder**: named `<dex>.png`, or `<dex>-<form>.png` for forms such as `19-alola.png` (128×128, transparent). These are cut from the Pokémon Shuffle sheets in [`sheets/`](sheets). To change or add one, edit [`sheets/cells.txt`](sheets/cells.txt) (dex, gen, column,row of the cell, counted from 0) and run `powershell -File sheets\crop.ps1`.
2. **Fallback**: official artwork from [PokeAPI/sprites](https://github.com/PokeAPI/sprites).

Want gen 8–9 too? The [`deviantart-icons` branch](https://github.com/liangforstudy/gdocs-anonymous-pokemon/tree/deviantart-icons) adds Shuffle-style icons by [Loran-Hemlock](https://www.deviantart.com/loran-hemlock/gallery), loaded from DeviantArt. It installs as a separate script; use one or the other.

To change sources, edit `SPRITE_SOURCE` at the top of the script.

**One file per Pokémon** (default; `url` can be a single template or a list tried in order):

```js
const SPRITE_SOURCE = {
  mode: 'files',
  url: [
    'https://raw.githubusercontent.com/YOU/REPO/main/sprites/{sprite}.png', // {sprite} (128-paldea, else dex), {dex}, {dex3} (025), {name} (pikachu)
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{dex}.png',
  ],
};
```

**One sheet per generation** (cropped in the browser):

```js
const SPRITE_SOURCE = {
  mode: 'sheets',
  sheets: {
    1: { url: '.../gen1.png', firstDex: 1, cols: 15, cellWidth: 64, cellHeight: 64, offsetX: 0, offsetY: 0, gapX: 0, gapY: 0 },
    // ...one entry per generation you use
  },
};
```

If a sheet has gaps or extra forms, pin any Pokémon to a specific cell with `positions: { 25: [9, 1] }` (column, row; 0-based). To swap in a single custom image, use `SPRITE_OVERRIDES`, e.g. `{ goose: 'https://.../quaquaval.png' }`.

### Sprites needed per generation

✅ = bundled in `sprites/`, unmarked = PokeAPI fallback for now, 😉 = winks half the time.

| Gen | Count | Pokémon |
|---|---|---|
| 1 | 49 | Charizard ✅, Squirtle ✅ 😉, Wartortle ✅, Blastoise ✅, Rattata ✅, Raticate ✅, Ekans ✅, Arbok ✅, Pikachu ✅ 😉, Raichu ✅ 😉, Sandshrew ✅, Sandslash ✅, Vulpix ✅, Ninetales ✅, Zubat ✅, Golbat ✅, Diglett ✅, Dugtrio ✅, Meowth ✅, Persian ✅, Psyduck ✅, Golduck ✅, Mankey ✅, Primeape ✅, Growlithe ✅, Arcanine ✅, Poliwag ✅, Poliwhirl ✅, Poliwrath ✅, Tentacool ✅, Tentacruel ✅, Ponyta ✅, Rapidash ✅, Slowpoke ✅, Slowbro ✅, Farfetch'd ✅, Seel ✅, Dewgong ✅, Rhyhorn ✅, Rhydon ✅, Kangaskhan ✅, Tauros ✅, Gyarados ✅, Lapras ✅, Ditto ✅, Snorlax ✅, Dratini ✅, Dragonair ✅, Dragonite ✅ |
| 2 | 32 | Totodile ✅ 😉, Croconaw ✅, Feraligatr ✅, Sentret ✅, Furret ✅, Crobat ✅, Pichu ✅, Natu ✅, Xatu ✅, Mareep ✅, Flaaffy ✅, Ampharos ✅, Politoed ✅, Aipom ✅, Wooper ✅, Quagsire ✅, Murkrow ✅, Slowking ✅, Girafarig ✅, Snubbull ✅, Granbull ✅, Sneasel ✅, Teddiursa ✅, Ursaring ✅, Remoraid ✅, Octillery ✅, Houndour ✅, Houndoom ✅, Phanpy ✅, Donphan ✅, Stantler ✅, Raikou ✅ |
| 3 | 32 | Torchic ✅ 😉, Combusken ✅, Blaziken ✅, Mudkip ✅ 😉, Marshtomp ✅, Swampert ✅, Poochyena ✅, Mightyena ✅, Zigzagoon ✅, Linoone ✅, Wingull ✅, Pelipper ✅, Skitty ✅, Delcatty ✅, Sableye ✅, Mega Sableye ✅, Electrike ✅, Manectric ✅, Sharpedo ✅, Wailmer ✅, Wailord ✅, Numel ✅, Camerupt ✅, Seviper ✅, Kecleon ✅, Spheal ✅, Sealeo ✅, Walrein ✅, Bagon ✅, Shelgon ✅, Salamence ✅, Rayquaza ✅ |
| 4 | 37 | Turtwig ✅ 😉, Grotle ✅, Torterra ✅, Chimchar ✅ 😉, Monferno ✅, Infernape ✅, Piplup ✅ 😉, Prinplup ✅, Empoleon ✅, Bidoof ✅, Bibarel ✅, Pachirisu ✅ 😉, Buizel ✅, Floatzel ✅, Ambipom ✅, Buneary ✅, Lopunny ✅, Honchkrow ✅, Glameow ✅, Purugly ✅, Stunky ✅, Skuntank ✅, Gible ✅, Gabite ✅, Garchomp ✅, Munchlax ✅, Riolu ✅, Lucario ✅, Hippopotas ✅, Hippowdon ✅, Croagunk ✅, Toxicroak ✅, Weavile ✅, Rhyperior ✅, Dialga ✅, Palkia ✅, Shaymin ✅ |
| 5 | 51 | Snivy ✅ 😉, Servine ✅, Serperior ✅, Oshawott ✅ 😉, Dewott ✅, Samurott ✅, Lillipup ✅, Herdier ✅, Stoutland ✅, Purrloin ✅, Liepard ✅, Pansage ✅, Simisage ✅, Pansear ✅, Simisear ✅, Panpour ✅, Simipour ✅, Blitzle ✅, Zebstrika ✅, Woobat ✅, Swoobat ✅, Tympole ✅, Palpitoad ✅, Seismitoad ✅, Basculin ✅, Sandile ✅, Krokorok ✅, Krookodile ✅, Tirtouga ✅, Carracosta ✅, Zorua ✅, Zoroark ✅, Minccino ✅, Cinccino ✅, Ducklett ✅, Swanna ✅, Emolga ✅, Axew ✅, Fraxure ✅, Haxorus ✅, Cubchoo ✅, Beartic ✅, Druddigon ✅, Bouffalant ✅, Heatmor ✅, Deino ✅, Zweilous ✅, Hydreigon ✅, Reshiram ✅, Zekrom ✅, Kyurem ✅ |
| 6 | 31 | Chespin ✅ 😉, Quilladin ✅, Chesnaught ✅, Fennekin ✅ 😉, Braixen ✅, Delphox ✅, Froakie ✅ 😉, Frogadier ✅, Greninja ✅, Diggersby ✅, Litleo ✅, Pyroar ✅, Gogoat ✅, Pancham ✅, Pangoro ✅, Furfrou ✅, Espurr ✅, Meowstic ✅, Helioptile ✅, Heliolisk ✅, Tyrunt ✅, Tyrantrum ✅, Amaura ✅, Aurorus ✅, Dedenne ✅ 😉, Pumpkaboo ✅, Gourgeist ✅, Noibat ✅, Noivern ✅, Hoopa Unbound ✅, Hoopa ✅ |
| 7 | 25 | Alolan Rattata ✅, Alolan Raticate ✅, Alolan Raichu ✅, Alolan Sandshrew ✅, Alolan Sandslash ✅, Alolan Vulpix ✅, Alolan Ninetales ✅, Alolan Dugtrio ✅, Alolan Meowth ✅, Alolan Persian ✅, Litten ✅, Torracat ✅, Incineroar ✅, Popplio ✅, Brionne ✅, Primarina ✅, Oricorio ✅, Rockruff ✅, Lycanroc ✅, Mudbray ✅, Mudsdale ✅, Oranguru ✅, Passimian ✅, Komala ✅, Togedemaru ✅ |

## Animal → Pokémon map

The 82 animals currently in Google's pool (each confirmed on Google's avatar server, including the newer Capybara and Chicken), then 3 retired ones, and the 2019 Endangered Species Day set.

Where an animal lists more than one Pokémon, one is picked at random for that animal each time the page loads (avatar and name always match).

| Anonymous… | Pokémon | Gen |
|---|---|---|
| Alligator | Feraligatr #160 / Totodile #158 😉 / Croconaw #159 / Sandile #551 / Krokorok #552 / Krookodile #553 | 2 / 5 |
| Anteater | Heatmor #631 | 5 |
| Armadillo | Sandslash #28 / Alolan Sandslash #28 | 1 / 7 |
| Auroch | Tauros #128 | 1 |
| Axolotl | Wooper #194 / Quagsire #195 / Mudkip #258 😉 / Marshtomp #259 / Swampert #260 | 2 / 3 |
| Badger | Linoone #264 / Zigzagoon #263 | 3 |
| Bat | Zubat #41 / Golbat #42 / Crobat #169 / Woobat #527 / Swoobat #528 / Noibat #714 / Noivern #715 | 1 / 2 / 5 / 6 |
| Beaver | Bidoof #399 / Bibarel #400 | 4 |
| Blobfish | Ditto #132 | 1 |
| Buffalo | Bouffalant #626 | 5 |
| Camel | Camerupt #323 / Numel #322 | 3 |
| Capybara | Bidoof #399 / Bibarel #400 | 4 |
| Chameleon | Kecleon #352 | 3 |
| Cheetah | Persian #53 / Alolan Persian #53 | 1 / 7 |
| Chicken | Torchic #255 😉 / Combusken #256 / Blaziken #257 | 3 |
| Chinchilla | Minccino #572 / Cinccino #573 | 5 |
| Chipmunk | Pachirisu #417 😉 | 4 |
| Chupacabra | Sableye #302 / Mega Sableye #302 | 3 |
| Cormorant | Pelipper #279 / Wingull #278 | 3 |
| Coyote | Poochyena #261 / Mightyena #262 | 3 |
| Crow | Murkrow #198 / Honchkrow #430 | 2 / 4 |
| Dingo | Rockruff #744 / Growlithe #58 / Arcanine #59 / Houndour #228 / Houndoom #229 / Snubbull #209 / Granbull #210 / Electrike #309 / Manectric #310 / Lillipup #506 / Herdier #507 / Stoutland #508 / Furfrou #676 | 7 / 1 / 2 / 3 / 5 / 6 |
| Dinosaur | Tyrantrum #697 / Tyrunt #696 / Amaura #698 / Aurorus #699 | 6 |
| Dolphin | Wailmer #320 / Wailord #321 / Brionne #729 | 3 / 7 |
| Dragon | Dragonite #149 / Dratini #147 / Dragonair #148 / Charizard #6 / Bagon #371 / Shelgon #372 / Salamence #373 / Gible #443 / Gabite #444 / Garchomp #445 / Axew #610 / Fraxure #611 / Haxorus #612 / Deino #633 / Zweilous #634 / Hydreigon #635 / Druddigon #621 / Rayquaza #384 / Dialga #483 / Palkia #484 / Reshiram #643 / Zekrom #644 / Kyurem #646 (+1 Pikachu forms) | 1 / 3 / 4 / 5 |
| Duck | Psyduck #54 / Golduck #55 / Farfetch'd #83 / Ducklett #580 / Swanna #581 | 1 / 5 |
| Dumbo Octopus | Octillery #224 / Remoraid #223 | 2 |
| Elephant | Donphan #232 / Phanpy #231 | 2 |
| Ferret | Furret #162 / Sentret #161 | 2 |
| Fox | Vulpix #37 / Ninetales #38 / Alolan Vulpix #37 / Alolan Ninetales #38 / Fennekin #653 😉 / Braixen #654 / Delphox #655 / Zorua #570 / Zoroark #571 | 1 / 7 / 6 / 5 |
| Frog | Froakie #656 😉 / Frogadier #657 / Greninja #658 / Poliwag #60 / Poliwhirl #61 / Poliwrath #62 / Politoed #186 / Croagunk #453 / Toxicroak #454 / Tympole #535 / Palpitoad #536 / Seismitoad #537 | 6 / 1 / 2 / 4 / 5 |
| Giraffe | Girafarig #203 | 2 |
| Goose | Ducklett #580 / Swanna #581 | 5 |
| Gopher | Diglett #50 / Dugtrio #51 / Alolan Dugtrio #51 | 1 / 7 |
| Grizzly | Ursaring #217 / Teddiursa #216 / Cubchoo #613 / Beartic #614 | 2 / 5 |
| Hamster | Pikachu #25 😉 / Pichu #172 / Raichu #26 😉 / Alolan Raichu #26 (+39 Pikachu forms) | 1 / 2 / 7 |
| Hedgehog | Chespin #650 😉 / Quilladin #651 / Chesnaught #652 / Shaymin #492 (+1 Pikachu forms) | 6 / 4 |
| Hippo | Hippopotas #449 / Hippowdon #450 | 4 |
| Hyena | Mightyena #262 / Poochyena #261 | 3 |
| Ibex | Gogoat #673 | 6 |
| Ifrit | Hoopa Unbound #720 / Hoopa #720 | 6 |
| Iguana | Heliolisk #695 / Helioptile #694 | 6 |
| Jackal | Lucario #448 / Riolu #447 | 4 |
| Jackalope | Diggersby #660 | 6 |
| Kangaroo | Kangaskhan #115 | 1 |
| Kiwi | Natu #177 / Xatu #178 / Oricorio #741 (+3 Pikachu forms) | 2 / 7 |
| Koala | Komala #775 | 7 |
| Kraken | Tentacruel #73 / Tentacool #72 / Gyarados #130 (+1 Pikachu forms) | 1 |
| Lemur | Aipom #190 / Ambipom #424 | 2 / 4 |
| Leopard | Liepard #510 / Purrloin #509 | 5 |
| Liger | Litleo #667 / Pyroar #668 (+1 Pikachu forms) | 6 |
| Llama | Mudbray #749 / Mudsdale #750 | 7 |
| Manatee | Lapras #131 | 1 |
| Mink | Buizel #418 / Floatzel #419 | 4 |
| Monkey | Mankey #56 / Primeape #57 / Chimchar #390 😉 / Monferno #391 / Infernape #392 / Pansage #511 / Simisage #512 / Pansear #513 / Simisear #514 / Panpour #515 / Simipour #516 | 1 / 4 / 5 |
| Moose | Stantler #234 | 2 |
| Narwhal | Seel #86 / Dewgong #87 / Popplio #728 / Primarina #730 | 1 / 7 |
| Nyan Cat | Meowth #52 / Alolan Meowth #52 / Skitty #300 / Delcatty #301 / Glameow #431 / Purugly #432 / Espurr #677 / Meowstic #678 (+1 Pikachu forms) | 1 / 7 / 3 / 4 / 6 |
| Orangutan | Oranguru #765 / Passimian #766 | 7 |
| Otter | Oshawott #501 😉 / Dewott #502 / Samurott #503 | 5 |
| Panda | Pancham #674 / Pangoro #675 | 6 |
| Penguin | Piplup #393 😉 / Prinplup #394 / Empoleon #395 | 4 |
| Platypus | Psyduck #54 / Golduck #55 | 1 |
| Pumpkin | Pumpkaboo #710 / Gourgeist #711 | 6 |
| Python | Ekans #23 / Arbok #24 / Seviper #336 / Snivy #495 😉 / Servine #496 / Serperior #497 | 1 / 3 / 5 |
| Quagga | Zebstrika #523 / Blitzle #522 | 5 |
| Quokka | Dedenne #702 😉 / Togedemaru #777 | 6 / 7 |
| Rabbit | Buneary #427 / Lopunny #428 | 4 |
| Raccoon | Zigzagoon #263 / Linoone #264 | 3 |
| Rhino | Rhyhorn #111 / Rhydon #112 / Rhyperior #464 | 1 / 4 |
| Sheep | Mareep #179 / Flaaffy #180 / Ampharos #181 | 2 |
| Shrew | Sandshrew #27 / Alolan Sandshrew #27 / Rattata #19 / Raticate #20 / Alolan Rattata #19 / Alolan Raticate #20 | 1 / 7 |
| Skunk | Stunky #434 / Skuntank #435 | 4 |
| Slow Loris | Slowpoke #79 / Slowbro #80 / Slowking #199 | 1 / 2 |
| Squirrel | Emolga #587 | 5 |
| Tiger | Raikou #243 / Litten #725 / Torracat #726 / Incineroar #727 | 2 / 7 |
| Turtle | Squirtle #7 😉 / Wartortle #8 / Blastoise #9 / Turtwig #387 😉 / Grotle #388 / Torterra #389 / Tirtouga #564 / Carracosta #565 | 1 / 4 / 5 |
| Unicorn | Rapidash #78 / Ponyta #77 | 1 |
| Walrus | Walrein #365 / Spheal #363 / Sealeo #364 | 3 |
| Wolf | Lycanroc #745 / Poochyena #261 / Mightyena #262 / Zorua #570 / Zoroark #571 | 7 / 3 / 5 |
| Wolverine | Sneasel #215 / Weavile #461 | 2 / 4 |
| Wombat | Munchlax #446 / Snorlax #143 | 4 / 1 |
| *Bear (retired)* | Teddiursa #216 | 2 |
| *Dog (retired)* | Growlithe #58 | 1 |
| *Lion (retired)* | Pyroar #668 | 6 |
| *African Wild Dog (2019)* | Houndour #228 | 2 |
| *Blue Whale (2019)* | Wailord #321 | 3 |
| *Desert-Dwelling Elephant (2019)* | Phanpy #231 | 2 |
| *Fossa (2019)* | Purrloin #509 | 5 |
| *Grey Reef Shark (2019)* | Sharpedo #319 | 3 |
| *Sumatran Orangutan (2019)* | Passimian #766 | 7 |
| *Pacific Bluefin Tuna (2019)* | Basculin #550 | 5 |
| *King Penguin (2019)* | Empoleon #395 | 4 |
| *Polar Bear (2019)* | Beartic #614 | 5 |
| *Siberian Tiger (2019)* | Incineroar #727 | 7 |

Don't like a pick? Change the `dex` and `name` for that animal in `ANIMALS` in the script. Add `alts: [{ dex, name }]` to give an animal random alternates.

## Sources for the animal list

- [Evert Meulie: complete list of anonymous animals](https://evert.meulie.net/faqwd/complete-list-anonymous-animals-on-google-drive-docs-sheets-slides/) (the crowdsourced list PopSci used)
- [GoogleWatchBlog (2013)](https://www.googlewatchblog.de/2013/04/google-drive-viewer-tiernamen/)
- [9to5Google: 2019 endangered animals](https://9to5google.com/2019/05/17/google-docs-endangered-animals/)
- [hmnd's gist](https://gist.github.com/hmnd/e1b4ef8a14d2ffcf89cface330c56b06) and [Querela's gist](https://gist.github.com/Querela/d6ec6f54893791936431) (Capybara, and the German names)
- Chicken: spotted live in a Doc (`chicken_lg_2.png`), not listed anywhere else

## Credits

- Gen 1–7 icons: ripped from *Pokémon Shuffle* (3DS), via [The Spriters Resource](https://www.spriters-resource.com/3ds/pokemonshuffle/).
- Gen 8–9 Shuffle-style icons on the [`deviantart-icons` branch](https://github.com/liangforstudy/gdocs-anonymous-pokemon/tree/deviantart-icons): by [Loran-Hemlock](https://www.deviantart.com/loran-hemlock/gallery), loaded from DeviantArt and not re-hosted.

## Eplouge

## AI Usage

I did most of the cherry Picking for the sprites, claude did the code, as well as the Deviantart fetch system. it will be inpossible to make the code without Claude.

## Disclaimer

Fan project, not affiliated with Google, Nintendo, Game Freak or The Pokémon Company. Pokémon names and sprites belong to their respective owners.
