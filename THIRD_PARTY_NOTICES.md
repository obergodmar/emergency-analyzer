# Third-party notices

The application code is licensed under [MIT](LICENSE), copyright © 2026 Emergency Analyzer contributors. This does not relicense third-party artwork, datasets, documentation or dependencies. Their original terms remain applicable. Application authorship was removed from the UI; third-party attribution is retained here.

## Historical interface icons

`src/core/icons/legacy.json` contains SVG geometry extracted from react-icons **3.11.0**. Paths are unchanged; the distribution format was converted from JavaScript components to JSON and a TypeScript renderer. The wrapper's [MIT license](src/core/icons/react-icons.LICENSE) is preserved. Source versions below come from that release's `VERSIONS` file, rather than current versions of the icon sets.

| Prefix | Source / version                                                                                          | Attribution                             | License text                                                                                   |
| ------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Ai     | [Ant Design Icons](https://github.com/ant-design/ant-design-icons), 4.0.0                                 | Ant Design authors                      | [MIT](LICENSES/Ant-Design-MIT.txt)                                                             |
| Bs     | [Bootstrap Icons](https://github.com/twbs/icons/tree/v1.0.0-alpha3), 1.0.0-alpha3                         | The Bootstrap Authors                   | [MIT](LICENSES/Bootstrap-MIT.txt)                                                              |
| Cg     | [css.gg](https://github.com/astrit/css.gg/tree/2.0.0), 2.0.0                                              | Astrit                                  | [MIT](LICENSES/CssGG-MIT.txt)                                                                  |
| Bi     | [Boxicons](https://github.com/atisawd/boxicons), 2.0.5                                                    | Atisa and Boxicons contributors         | [CC BY 4.0](LICENSES/CC-BY-4.0.txt), as recorded by react-icons 3.11.0                         |
| Vsc    | [VS Code Codicons](https://github.com/microsoft/vscode-codicons), 0.0.1                                   | Microsoft Corporation                   | [CC BY 4.0](LICENSES/Codicons.txt)                                                             |
| Fa     | [Font Awesome](https://github.com/FortAwesome/Font-Awesome/tree/0d1f27efb836eb2ab994ba37221849ed64a73e5c) | Fonticons, Inc.                         | [Upstream notice](LICENSES/Font-Awesome.txt); SVG artwork: [CC BY 4.0](LICENSES/CC-BY-4.0.txt) |
| Gi     | [Game Icons](https://game-icons.net/)                                                                     | Lorc, Delapouite, Skoll, Viscious Speed | [CC BY 3.0](LICENSES/CC-BY-3.0.txt)                                                            |
| Md     | [Material Design Icons](https://github.com/google/material-design-icons/tree/3.0.1), 3.0.1                | Google Inc.                             | [Apache 2.0](LICENSES/Material-Design-Apache-2.0.txt)                                          |
| Ri     | [Remix Icon](https://github.com/Remix-Design/RemixIcon/tree/v2.5.0), 2.5.0                                | Remix Design                            | [Apache 2.0 of this historical release](LICENSES/Remix-Apache-2.0.txt)                         |
| Si     | [Simple Icons](https://github.com/simple-icons/simple-icons/tree/2.13.0), 2.13.0                          | Simple Icons contributors               | [CC0](LICENSES/Simple-Icons-CC0.txt); trademarks remain their owners' property                 |
| Ti     | [Typicons](https://github.com/stephenhutchings/typicons.font), 2.0.9                                      | Stephen Hutchings                       | [CC BY-SA 3.0](LICENSES/CC-BY-SA-3.0.txt); the Typicons artwork remains under these terms      |

Game Icons attribution by included artwork (names correspond to the `Gi` symbols in `legacy.json`):

- Lorc: BleedingHeart, Bandaged, TreasureMap, MeteorImpact, MaterialsScience, SmallFire, Disintegrate, Terror, Quicksand, MiddleArrow, FastArrow, CometSpark, BurningMeteor, BleedingEye.
- Delapouite: SettingsKnobs, Asteroid, Factory, Resize.
- Skoll: NuclearBomb, BurningSkull.
- Viscious Speed: [Abstract096](https://game-icons.net/1x1/viscious-speed/abstract-096.html), released under [CC0](LICENSES/Simple-Icons-CC0.txt), rather than the collection’s general CC BY 3.0 license.

Creative Commons legal texts are included from the [SPDX license list](https://github.com/spdx/license-list-data/tree/main/text). Upstream copyright notices are preserved in the accompanying files. Ant Design and Codicons license notices were obtained from their current upstream repositories; the historical license identifiers are recorded above.

## Gatsby starter

The original Gatsby starter's [0BSD notice](LICENSES/Gatsby-0BSD.txt) is retained for inherited starter material. Gatsby is not a runtime dependency of this application.

## PDF.js assets

PDF.js is installed through `react-pdf`. Its worker, character maps, standard fonts and WASM codecs are copied locally at installation time. The [PDF.js Apache 2.0 license](LICENSES/PDFjs-pdfjs-dist-LICENSE.txt) and the original font, CMap and codec notices are included in `LICENSES/PDFjs-*`. The install script also retains these notices alongside the generated assets under `public/pdf-assets/`. These files are not covered by the application's MIT license.

## Archived project material

Historical catalog records, country geometry and the RU/EN PDF guides were supplied with the original project. Their local provenance and modifications are documented in [data sources](docs/data-sources.md) and [source hashes](docs/source-manifest.json). Their original external sources and redistribution terms are not fully documented in that archive. Inclusion here does not establish new rights or place third-party material under MIT. The project's MIT license applies to application code, not an assertion of ownership of embedded third-party illustrations, geographic data or archival text.

## Mapbox and package dependencies

Mapbox GL JS and the Mapbox service retain their own terms and map attribution. Attribution remains visible in the map. Other installed packages keep the license files distributed with their pinned versions in `pnpm-lock.yaml`; they are not relicensed by this repository.
