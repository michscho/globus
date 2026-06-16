        // ========== DATA SOURCES ==========
        // Country data:  REST Countries API (https://restcountries.com) - Open Source
        // Country borders: datasets/geo-countries (GitHub) - Open Data
        // Rivers:         Natural Earth (naturalearthdata.com) - Public Domain
        // Mountains:      Custom dataset (coordinates + metadata)

        // ========== GLOBALS ==========
        let map, countriesLayer, riversLayer, mountainsLayer;
        let showRiversFlag = true, showMountainsFlag = true;
        let currentMode = 'countries', currentRegion = 'world', currentTab = 'quiz';
        let quizActive = false, learnActive = false;
        let currentQuestion = null;
        let qIndex = 0, totalQ = 10;
        let score = 0, streak = 0, correct = 0, wrong = 0, hints = 0;
        let used = [], highlighted = [], wrongAnswers = [];
        let learnItems = [], learnIndex = 0;
        let allRivers = []; // Store all river layers for easy access

        // ========== MNEMONICS (custom German learning aids) ==========
        const mnemonicsDB = {
            "DEU": "Berlin beginnt mit B wie Bier!",
            "FRA": "Paris = Eiffelturm, Frankreich wie ein Sechseck",
            "ESP": "Madrid in der Mitte, Spanien wie ein Stierkopf",
            "ITA": "Italien = Stiefel der nach Sizilien kickt!",
            "PRT": "Portal zum Atlantik - ganz am Rand",
            "NLD": "NIEDERlande = NIEDRIG, unter dem Meer",
            "BEL": "Brüssel = Schokolade, klein zwischen Großen",
            "AUT": "Wien = Wiener Schnitzel, östlich der Schweiz",
            "CHE": "Schweiz = neutral wie Käse mit Löchern",
            "POL": "Polen = flach, östlich von Deutschland",
            "GRC": "Athen = Antike! Viele Finger ins Meer",
            "SWE": "Stockholm auf Inseln, Schweden lang wie Ski",
            "NOR": "NORwegen = NORd-Weg mit Fjorden",
            "FIN": "FINNland = 1000 Seen",
            "DNK": "Dänemark = Brücke nach Skandinavien",
            "GBR": "London an der Themse",
            "IRL": "Grüne Insel - Dublin",
            "ROU": "Rumänien = Dracula in den Karpaten",
            "UKR": "Ukraine = größtes Land ganz in Europa",
            "CZE": "Prag = prächtig! Tschechien wie ein Hut",
            "HUN": "Budapest = Buda + Pest an der Donau",
            "CHN": "China wie ein Hahn auf der Karte",
            "JPN": "Japan = aufgehende Sonne, Inseln wie Drache",
            "KOR": "Seoul = Soul, Halbinsel zeigt nach Japan",
            "IND": "Indien = Dreieck das ins Meer taucht",
            "THA": "Thailand = Elefantenkopf mit Rüssel!",
            "VNM": "Vietnam lang und dünn wie ein S",
            "IDN": "Indonesien = 17.000 Inseln wie Perlen",
            "TUR": "Türkei = Brücke Europa-Asien",
            "SAU": "Saudi-Arabien = fast ganze arab. Halbinsel",
            "IRN": "Iran = Persien, zwischen Irak und Afghanistan",
            "EGY": "Ägypten = Pyramiden am Nil!",
            "ZAF": "Südafrika = Südspitze mit 3 Hauptstädten",
            "MAR": "Marokko = NW-Ecke, 14km von Spanien",
            "KEN": "Kenia am Äquator - Safari!",
            "NGA": "Nigeria = bevölkerungsreichstes Land Afrikas",
            "ETH": "Äthiopien = nie kolonisiert!",
            "DZA": "Algerien = größtes Land Afrikas",
            "USA": "D.C. an der Ostküste, nicht Staat Washington!",
            "CAN": "Kanada = zweitgrößtes Land der Welt",
            "MEX": "Mexiko-Stadt im Hochtal",
            "CUB": "Kuba = größte Karibikinsel wie Krokodil",
            "BRA": "Brasilien = größtes Land Südamerikas",
            "ARG": "Buenos Aires = Gute Lüfte",
            "CHL": "Chile = lang und schmal wie Chili!",
            "PER": "Peru = Machu Picchu!",
            "COL": "Kolumbien an zwei Ozeanen",
            "AUS": "Canberra zwischen Sydney und Melbourne",
            "NZL": "Neuseeland = zwei Inseln"
        };

        // German translations for capital names that differ from English
        const capitalDE = {
            "Rome": "Rom", "Lisbon": "Lissabon", "Brussels": "Brüssel",
            "Vienna": "Wien", "Warsaw": "Warschau", "Athens": "Athen",
            "Copenhagen": "Kopenhagen", "Bucharest": "Bukarest", "Kyiv": "Kiew",
            "Prague": "Prag", "Beijing": "Peking", "Tokyo": "Tokio",
            "New Delhi": "Neu-Delhi", "Riyadh": "Riad", "Tehran": "Teheran",
            "Cairo": "Kairo", "Addis Ababa": "Addis Abeba", "Algiers": "Algier",
            "Washington, D.C.": "Washington D.C.", "Mexico City": "Mexiko-Stadt",
            "Havana": "Havanna"
        };

        // ========== COUNTRIES (fallback data, overwritten by API) ==========
        let countriesDB = {
            europe: [
                { name: "Deutschland", capital: "Berlin", code: "DEU", flag: "🇩🇪", mnemonic: "Berlin beginnt mit B wie Bier!" },
                { name: "Frankreich", capital: "Paris", code: "FRA", flag: "🇫🇷", mnemonic: "Paris = Eiffelturm, Frankreich wie ein Sechseck" },
                { name: "Spanien", capital: "Madrid", code: "ESP", flag: "🇪🇸", mnemonic: "Madrid in der Mitte, Spanien wie ein Stierkopf" },
                { name: "Italien", capital: "Rom", code: "ITA", flag: "🇮🇹", mnemonic: "Italien = Stiefel der nach Sizilien kickt!" },
                { name: "Portugal", capital: "Lissabon", code: "PRT", flag: "🇵🇹", mnemonic: "Portal zum Atlantik - ganz am Rand" },
                { name: "Niederlande", capital: "Amsterdam", code: "NLD", flag: "🇳🇱", mnemonic: "NIEDERlande = NIEDRIG, unter dem Meer" },
                { name: "Belgien", capital: "Brüssel", code: "BEL", flag: "🇧🇪", mnemonic: "Brüssel = Schokolade, klein zwischen Großen" },
                { name: "Österreich", capital: "Wien", code: "AUT", flag: "🇦🇹", mnemonic: "Wien = Wiener Schnitzel, östlich der Schweiz" },
                { name: "Schweiz", capital: "Bern", code: "CHE", flag: "🇨🇭", mnemonic: "Schweiz = neutral wie Käse mit Löchern" },
                { name: "Polen", capital: "Warschau", code: "POL", flag: "🇵🇱", mnemonic: "Polen = flach, östlich von Deutschland" },
                { name: "Griechenland", capital: "Athen", code: "GRC", flag: "🇬🇷", mnemonic: "Athen = Antike! Viele Finger ins Meer" },
                { name: "Schweden", capital: "Stockholm", code: "SWE", flag: "🇸🇪", mnemonic: "Stockholm auf Inseln, Schweden lang wie Ski" },
                { name: "Norwegen", capital: "Oslo", code: "NOR", flag: "🇳🇴", mnemonic: "NORwegen = NORd-Weg mit Fjorden" },
                { name: "Finnland", capital: "Helsinki", code: "FIN", flag: "🇫🇮", mnemonic: "FINNland = 1000 Seen" },
                { name: "Dänemark", capital: "Kopenhagen", code: "DNK", flag: "🇩🇰", mnemonic: "Dänemark = Brücke nach Skandinavien" },
                { name: "Vereinigtes Königreich", capital: "London", code: "GBR", flag: "🇬🇧", mnemonic: "London an der Themse" },
                { name: "Irland", capital: "Dublin", code: "IRL", flag: "🇮🇪", mnemonic: "Grüne Insel - Dublin" },
                { name: "Rumänien", capital: "Bukarest", code: "ROU", flag: "🇷🇴", mnemonic: "Rumänien = Dracula in den Karpaten" },
                { name: "Ukraine", capital: "Kiew", code: "UKR", flag: "🇺🇦", mnemonic: "Ukraine = größtes Land ganz in Europa" },
                { name: "Tschechien", capital: "Prag", code: "CZE", flag: "🇨🇿", mnemonic: "Prag = prächtig! Tschechien wie ein Hut" },
                { name: "Ungarn", capital: "Budapest", code: "HUN", flag: "🇭🇺", mnemonic: "Budapest = Buda + Pest an der Donau" }
            ],
            asia: [
                { name: "China", capital: "Peking", code: "CHN", flag: "🇨🇳", mnemonic: "China wie ein Hahn auf der Karte" },
                { name: "Japan", capital: "Tokio", code: "JPN", flag: "🇯🇵", mnemonic: "Japan = aufgehende Sonne, Inseln wie Drache" },
                { name: "Südkorea", capital: "Seoul", code: "KOR", flag: "🇰🇷", mnemonic: "Seoul = Soul, Halbinsel zeigt nach Japan" },
                { name: "Indien", capital: "Neu-Delhi", code: "IND", flag: "🇮🇳", mnemonic: "Indien = Dreieck das ins Meer taucht" },
                { name: "Thailand", capital: "Bangkok", code: "THA", flag: "🇹🇭", mnemonic: "Thailand = Elefantenkopf mit Rüssel!" },
                { name: "Vietnam", capital: "Hanoi", code: "VNM", flag: "🇻🇳", mnemonic: "Vietnam lang und dünn wie ein S" },
                { name: "Indonesien", capital: "Jakarta", code: "IDN", flag: "🇮🇩", mnemonic: "Indonesien = 17.000 Inseln wie Perlen" },
                { name: "Türkei", capital: "Ankara", code: "TUR", flag: "🇹🇷", mnemonic: "Türkei = Brücke Europa-Asien" },
                { name: "Saudi-Arabien", capital: "Riad", code: "SAU", flag: "🇸🇦", mnemonic: "Saudi-Arabien = fast ganze arab. Halbinsel" },
                { name: "Iran", capital: "Teheran", code: "IRN", flag: "🇮🇷", mnemonic: "Iran = Persien, zwischen Irak und Afghanistan" }
            ],
            africa: [
                { name: "Ägypten", capital: "Kairo", code: "EGY", flag: "🇪🇬", mnemonic: "Ägypten = Pyramiden am Nil!" },
                { name: "Südafrika", capital: "Pretoria", code: "ZAF", flag: "🇿🇦", mnemonic: "Südafrika = Südspitze mit 3 Hauptstädten" },
                { name: "Marokko", capital: "Rabat", code: "MAR", flag: "🇲🇦", mnemonic: "Marokko = NW-Ecke, 14km von Spanien" },
                { name: "Kenia", capital: "Nairobi", code: "KEN", flag: "🇰🇪", mnemonic: "Kenia am Äquator - Safari!" },
                { name: "Nigeria", capital: "Abuja", code: "NGA", flag: "🇳🇬", mnemonic: "Nigeria = bevölkerungsreichstes Land Afrikas" },
                { name: "Äthiopien", capital: "Addis Abeba", code: "ETH", flag: "🇪🇹", mnemonic: "Äthiopien = nie kolonisiert!" },
                { name: "Algerien", capital: "Algier", code: "DZA", flag: "🇩🇿", mnemonic: "Algerien = größtes Land Afrikas" }
            ],
            northAmerica: [
                { name: "USA", capital: "Washington D.C.", code: "USA", flag: "🇺🇸", mnemonic: "D.C. an der Ostküste, nicht Staat Washington!" },
                { name: "Kanada", capital: "Ottawa", code: "CAN", flag: "🇨🇦", mnemonic: "Kanada = zweitgrößtes Land der Welt" },
                { name: "Mexiko", capital: "Mexiko-Stadt", code: "MEX", flag: "🇲🇽", mnemonic: "Mexiko-Stadt im Hochtal" },
                { name: "Kuba", capital: "Havanna", code: "CUB", flag: "🇨🇺", mnemonic: "Kuba = größte Karibikinsel wie Krokodil" }
            ],
            southAmerica: [
                { name: "Brasilien", capital: "Brasília", code: "BRA", flag: "🇧🇷", mnemonic: "Brasilien = größtes Land Südamerikas" },
                { name: "Argentinien", capital: "Buenos Aires", code: "ARG", flag: "🇦🇷", mnemonic: "Buenos Aires = Gute Lüfte" },
                { name: "Chile", capital: "Santiago", code: "CHL", flag: "🇨🇱", mnemonic: "Chile = lang und schmal wie Chili!" },
                { name: "Peru", capital: "Lima", code: "PER", flag: "🇵🇪", mnemonic: "Peru = Machu Picchu!" },
                { name: "Kolumbien", capital: "Bogotá", code: "COL", flag: "🇨🇴", mnemonic: "Kolumbien an zwei Ozeanen" }
            ],
            oceania: [
                { name: "Australien", capital: "Canberra", code: "AUS", flag: "🇦🇺", mnemonic: "Canberra zwischen Sydney und Melbourne" },
                { name: "Neuseeland", capital: "Wellington", code: "NZL", flag: "🇳🇿", mnemonic: "Neuseeland = zwei Inseln" }
            ]
        };

        // ========== RIVERS - Namen und Infos ==========
        const riverDB = {
            "Rhine": { de: "Rhein", hint: "Durch Deutschland zur Nordsee", mnemonic: "RHEIN ist REIN - durch 6 Länder!", length: "1233 km" },
            "Danube": { de: "Donau", hint: "Durch Wien und Budapest", mnemonic: "DONAU DONnert durch 10 Länder!", length: "2857 km" },
            "Elbe": { de: "Elbe", hint: "Durch Hamburg", mnemonic: "ELBE ist ELEGANT durch Dresden nach Hamburg", length: "1094 km" },
            "Seine": { de: "Seine", hint: "Durch Paris", mnemonic: "An der SEINE sitzt man SCHÖN", length: "777 km" },
            "Thames": { de: "Themse", hint: "Durch London", mnemonic: "THEMSE = TEE, sehr britisch", length: "346 km" },
            "Loire": { de: "Loire", hint: "Längster Fluss Frankreichs", mnemonic: "LOIRE ist am längsten in Frankreich", length: "1006 km" },
            "Po": { de: "Po", hint: "Längster Fluss Italiens", mnemonic: "PO in der PO-Ebene Italiens", length: "652 km" },
            "Volga": { de: "Wolga", hint: "Längster Fluss Europas", mnemonic: "WOLGA wie ein WAL - riesig!", length: "3530 km" },
            "Nile": { de: "Nil", hint: "Längster Fluss der Welt", mnemonic: "NIL ist NIE still seit 5000 Jahren", length: "6650 km" },
            "Congo": { de: "Kongo", hint: "Zweitlängster in Afrika", mnemonic: "KONGO ist KOLOSSAL tief!", length: "4374 km" },
            "Niger": { de: "Niger", hint: "Westafrika", mnemonic: "NIGER macht eine NEUN-Kurve", length: "4180 km" },
            "Amazon": { de: "Amazonas", hint: "Wasserreichster Fluss", mnemonic: "AMAZONAS = AMAZING viel Wasser!", length: "6992 km" },
            "Amazonas": { de: "Amazonas", hint: "Wasserreichster Fluss", mnemonic: "AMAZONAS = AMAZING viel Wasser!", length: "6992 km" },
            "Mississippi": { de: "Mississippi", hint: "Größter Fluss der USA", mnemonic: "MISSISSIPPI: 4x S, 4x I, 2x P!", length: "3778 km" },
            "Missouri": { de: "Missouri", hint: "Längster Nebenfluss", mnemonic: "MISSOURI länger als Mississippi selbst!", length: "3767 km" },
            "Colorado": { de: "Colorado", hint: "Grand Canyon", mnemonic: "COLORADO ist COLORFUL - malte Grand Canyon", length: "2330 km" },
            "Yangtze": { de: "Jangtse", hint: "Längster Fluss Asiens", mnemonic: "JANGTSE teilt China in Nord/Süd", length: "6380 km" },
            "Chang Jiang": { de: "Jangtse", hint: "Längster Fluss Asiens", mnemonic: "JANGTSE teilt China in Nord/Süd", length: "6380 km" },
            "Mekong": { de: "Mekong", hint: "Südostasien", mnemonic: "MEKONG = MUTTER-Fluss für 60 Mio Menschen", length: "4350 km" },
            "Ganges": { de: "Ganges", hint: "Heiliger Fluss Indiens", mnemonic: "GANGES ist GÖTTLICH für 1 Mrd Hindus", length: "2525 km" },
            "Ganga": { de: "Ganges", hint: "Heiliger Fluss Indiens", mnemonic: "GANGES ist GÖTTLICH", length: "2525 km" },
            "Indus": { de: "Indus", hint: "Durch Pakistan", mnemonic: "INDUS gab INDIEN den Namen!", length: "3180 km" },
            "Murray": { de: "Murray", hint: "Australiens längster", mnemonic: "MURRAY macht MÜDE - langsam und trocken", length: "2508 km" },
            "Ob": { de: "Ob", hint: "Sibirien", mnemonic: "OB fließt nach OBen ins Eismeer", length: "3650 km" },
            "Ob'": { de: "Ob", hint: "Sibirien", mnemonic: "OB fließt nach OBen ins Eismeer", length: "3650 km" },
            "Yenisei": { de: "Jenissei", hint: "Sibirien", mnemonic: "JENISSEI teilt Sibirien", length: "5539 km" },
            "Yenisey": { de: "Jenissei", hint: "Sibirien", mnemonic: "JENISSEI teilt Sibirien", length: "5539 km" },
            "Lena": { de: "Lena", hint: "Ostsibirien", mnemonic: "LENA ist 7 Monate gefroren!", length: "4294 km" },
            "Amur": { de: "Amur", hint: "Russland-China Grenze", mnemonic: "AMUR = AMOR zwischen Russland und China", length: "2824 km" },
            "Tigris": { de: "Tigris", hint: "Durch Bagdad", mnemonic: "TIGRIS wie ein TIGER durch Mesopotamien", length: "1900 km" },
            "Euphrates": { de: "Euphrat", hint: "Mesopotamien", mnemonic: "EUPHRAT = EU-PRACHT der Wiege der Zivilisation", length: "2800 km" },
            "Zambezi": { de: "Sambesi", hint: "Victoriafälle", mnemonic: "SAMBESI hat die SAMBA der Viktoriafälle!", length: "2574 km" },
            "Orange": { de: "Oranje", hint: "Südafrika", mnemonic: "ORANJE ist ORANGE wie die Wüste", length: "2200 km" }
        };

        // ========== MOUNTAINS ==========
        const mountainsData = [
            { name: "Alpen", hint: "Höchstes Gebirge Europas", mnemonic: "ALPEN = ALPTRAUM zu überqueren, Mont Blanc 4810m", peak: "Mont Blanc 4810m", coords: [[[43.8,7],[45.8,6.8],[47.3,9.5],[47.5,11],[47.3,13],[46.3,14.8],[45.5,13.8],[44.5,9],[43.8,7]]] },
            { name: "Pyrenäen", hint: "Spanien-Frankreich Grenze", mnemonic: "PYRENÄEN = PYRAMIDE zwischen den Ländern", peak: "Aneto 3404m", coords: [[[42.9,-1.8],[43,0],[42.4,2.5],[42.1,2.8],[42.6,-0.5],[42.9,-1.8]]] },
            { name: "Karpaten", hint: "Osteuropa/Rumänien", mnemonic: "KARPATEN = KRUMM wie C, Dracula wohnt hier!", peak: "Gerlach 2655m", coords: [[[49.5,18.5],[48.5,22.5],[46.5,25.5],[45,23.5],[46.5,21],[49.5,18.5]]] },
            { name: "Himalaya", hint: "Höchstes Gebirge der Welt", mnemonic: "HIMALAYA = HIMMLISCH hoch! Everest 8849m", peak: "Everest 8849m", coords: [[[36,74],[33,79],[28.5,84],[27,92],[29,92],[34,78],[36,74]]] },
            { name: "Anden", hint: "Längstes Gebirge (7000km)", mnemonic: "ANDEN sind ANDERS - 7000km lang!", peak: "Aconcagua 6961m", coords: [[[-10,-78],[-20,-69],[-33,-70.5],[-50,-73.5],[-45,-73],[-25,-68],[-10,-78]]] },
            { name: "Rocky Mountains", hint: "Nordamerika", mnemonic: "ROCKIES sind ROCKIG - 4800km lang", peak: "Elbert 4401m", coords: [[[60,-130],[50,-116],[40,-108],[35,-106],[42,-111],[55,-125],[60,-130]]] },
            { name: "Ural", hint: "Europa-Asien Grenze", mnemonic: "URAL = URALTE Grenze der Kontinente", peak: "Narodnaja 1895m", coords: [[[68.5,66],[62,59],[54,58.5],[52.5,60.5],[60,60],[68.5,66]]] },
            { name: "Atlas", hint: "Nordafrika", mnemonic: "ATLAS trägt AFRIKA wie der griechische Titan", peak: "Toubkal 4167m", coords: [[[35.5,-5.5],[33.5,0],[31,5.5],[33,0.5],[35.5,-5.5]]] },
            { name: "Kaukasus", hint: "Zwischen Schwarzem u. Kaspischem Meer", mnemonic: "KAUKASUS ist KOMPLIZIERT - höher als Alpen!", peak: "Elbrus 5642m", coords: [[[43.5,40],[42,45],[43.5,48],[43.5,45],[43.5,40]]] },
            { name: "Apennin", hint: "Rückgrat Italiens", mnemonic: "APENNIN = WIRBELSÄULE des Stiefels", peak: "Corno Grande 2912m", coords: [[[44.5,8],[43.5,11.5],[40,16],[40.5,15.5],[43,12],[44.5,8]]] }
        ];

        let nameMapping = {
            "Germany": "Deutschland", "France": "Frankreich", "Spain": "Spanien",
            "Italy": "Italien", "Portugal": "Portugal", "Netherlands": "Niederlande",
            "Belgium": "Belgien", "Austria": "Österreich", "Switzerland": "Schweiz",
            "Poland": "Polen", "Czechia": "Tschechien", "Czech Republic": "Tschechien",
            "Hungary": "Ungarn", "Greece": "Griechenland", "Sweden": "Schweden",
            "Norway": "Norwegen", "Denmark": "Dänemark", "Finland": "Finnland",
            "Ireland": "Irland", "United Kingdom": "Vereinigtes Königreich",
            "Romania": "Rumänien", "Ukraine": "Ukraine",
            "China": "China", "Japan": "Japan", "South Korea": "Südkorea",
            "India": "Indien", "Thailand": "Thailand", "Vietnam": "Vietnam",
            "Indonesia": "Indonesien", "Turkey": "Türkei", "Saudi Arabia": "Saudi-Arabien",
            "Iran": "Iran",
            "Egypt": "Ägypten", "South Africa": "Südafrika", "Morocco": "Marokko",
            "Kenya": "Kenia", "Nigeria": "Nigeria", "Ethiopia": "Äthiopien",
            "Algeria": "Algerien",
            "United States of America": "USA", "Canada": "Kanada", "Mexico": "Mexiko",
            "Cuba": "Kuba",
            "Brazil": "Brasilien", "Argentina": "Argentinien", "Chile": "Chile",
            "Peru": "Peru", "Colombia": "Kolumbien",
            "Australia": "Australien", "New Zealand": "Neuseeland"
        };

        // ========== OPEN SOURCE DATA: REST Countries API ==========
        async function fetchCountriesFromAPI() {
            try {
                const res = await fetch('https://restcountries.com/v3.1/all?fields=name,translations,capital,cca3,flag,region,subregion');
                if (!res.ok) throw new Error('API response: ' + res.status);
                const data = await res.json();

                const newDB = {};
                // Merge with existing nameMapping to preserve GeoJSON name variants
                // (e.g., GeoJSON uses "Turkey" while API uses "Türkiye")
                const newMapping = { ...nameMapping };

                for (const c of data) {
                    const code = c.cca3;
                    if (!code || !c.name) continue; // Skip malformed entries
                    const germanName = c.translations?.deu?.common || c.name.common;
                    const englishName = c.name.common;
                    const rawCapital = c.capital?.[0] || '';
                    const capital = capitalDE[rawCapital] || rawCapital;
                    const flag = c.flag || '';

                    // Add to nameMapping for all countries (English → German)
                    newMapping[englishName] = germanName;
                    if (c.name.official) newMapping[c.name.official] = germanName;

                    // Only include curated countries (with mnemonics) in the quiz database;
                    // other countries still get added to nameMapping for map click recognition
                    if (!mnemonicsDB[code]) continue;

                    let region;
                    switch (c.region) {
                        case 'Europe': region = 'europe'; break;
                        case 'Asia': region = 'asia'; break;
                        case 'Africa': region = 'africa'; break;
                        case 'Oceania': region = 'oceania'; break;
                        case 'Americas':
                            region = c.subregion === 'South America' ? 'southAmerica' : 'northAmerica';
                            break;
                        default: continue;
                    }

                    if (!newDB[region]) newDB[region] = [];
                    newDB[region].push({
                        name: germanName,
                        capital: capital,
                        code: code,
                        flag: flag,
                        mnemonic: mnemonicsDB[code]
                    });
                }

                countriesDB = newDB;
                nameMapping = newMapping;
            } catch (e) {
                console.warn('REST Countries API unavailable, using fallback data:', e.message);
            }
        }

        // ========== MAP INIT ==========
        async function initMap() {
            // Auto-collapse mode panel on mobile for more map visibility
            if (window.innerWidth <= 768) {
                document.getElementById('modePanel').classList.add('collapsed');
                document.getElementById('collapseBtn').textContent = '▶';
            }

            updateLoad(5, "Starte...");

            // Fetch country data from open source REST Countries API
            updateLoad(8, "Länderdaten (API)...");
            await fetchCountriesFromAPI();

            map = L.map('map', {
                center: [25, 0], zoom: 2, minZoom: 2, maxZoom: 10,
                worldCopyJump: true, zoomControl: false
            });

            updateLoad(15, "Basiskarte...");
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: '©OSM ©CartoDB'
            }).addTo(map);

            updateLoad(30, "Länder laden...");
            await loadCountries();

            updateLoad(55, "Flüsse laden...");
            await loadRivers();

            updateLoad(80, "Gebirge laden...");
            loadMountains();

            updateLoad(100, "Fertig!");
            setTimeout(() => document.getElementById('loadingOverlay').classList.add('hidden'), 300);
        }

        function updateLoad(p, t) {
            document.getElementById('loadingBar').style.width = p + '%';
            document.getElementById('loadingStatus').textContent = t;
        }

        async function loadCountries() {
            try {
                const res = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
                const data = await res.json();
                countriesLayer = L.geoJSON(data, {
                    style: () => ({ fillColor: '#152238', weight: 1, opacity: 0.8, color: '#2a4a6a', fillOpacity: 0.65 }),
                    onEachFeature: (f, l) => l.on({ mouseover: hoverCountry, mouseout: outCountry, click: clickCountry })
                }).addTo(map);
            } catch (e) { console.error(e); }
        }

        async function loadRivers() {
            try {
                const res = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_rivers_lake_centerlines.geojson');
                const data = await res.json();

                // Filter rivers we have info for or high importance
                const filtered = data.features.filter(f => {
                    const n = f.properties.name || '';
                    return riverDB[n] || f.properties.scalerank <= 4;
                });

                riversLayer = L.geoJSON({ type: 'FeatureCollection', features: filtered }, {
                    style: () => ({ color: '#00bfff', weight: 2.5, opacity: 0.75 }),
                    onEachFeature: (f, l) => {
                        const rawName = f.properties.name || '';
                        const info = riverDB[rawName];

                        l.riverRawName = rawName;
                        l.riverInfo = info;
                        l.riverDisplayName = info ? info.de : rawName;

                        // Store for quiz
                        if (info) {
                            allRivers.push({
                                layer: l,
                                rawName: rawName,
                                displayName: info.de,
                                info: info
                            });
                        }

                        l.bindTooltip(l.riverDisplayName || rawName, { className: 'river-tooltip', sticky: true });
                        l.on({ mouseover: hoverRiver, mouseout: outRiver, click: clickRiver });
                    }
                }).addTo(map);

            } catch (e) { console.error('River load error:', e); }
        }

        function loadMountains() {
            mountainsLayer = L.layerGroup().addTo(map);
            mountainsData.forEach(m => {
                const poly = L.polygon(m.coords, {
                    color: '#cd853f', weight: 2, fillColor: '#8b4513', fillOpacity: 0.35
                });
                poly.mtData = m;
                poly.bindTooltip('⛰️ ' + m.name, { className: 'mountain-tooltip', sticky: true });
                poly.on({ mouseover: hoverMountain, mouseout: outMountain, click: clickMountain });
                mountainsLayer.addLayer(poly);
            });
        }

        // ========== HOVER/OUT ==========
        function hoverCountry(e) {
            if (!highlighted.includes(e.target))
                e.target.setStyle({ fillColor: '#203858', weight: 2, color: '#00d4ff', fillOpacity: 0.8 });
        }
        function outCountry(e) {
            if (!highlighted.includes(e.target))
                e.target.setStyle({ fillColor: '#152238', weight: 1, color: '#2a4a6a', fillOpacity: 0.65 });
        }
        function hoverRiver(e) {
            if (!highlighted.includes(e.target)) e.target.setStyle({ weight: 5, opacity: 1 });
        }
        function outRiver(e) {
            if (!highlighted.includes(e.target)) e.target.setStyle({ weight: 2.5, opacity: 0.75, color: '#00bfff' });
        }
        function hoverMountain(e) {
            if (!highlighted.includes(e.target)) e.target.setStyle({ fillOpacity: 0.55, weight: 3 });
        }
        function outMountain(e) {
            if (!highlighted.includes(e.target)) e.target.setStyle({ fillOpacity: 0.35, weight: 2, color: '#cd853f' });
        }

        // ========== CLICKS ==========
        function clickCountry(e) {
            if (learnActive) { showCountryLearn(e.target); return; }
            if (!quizActive || !currentQuestion) return;
            if (currentQuestion.type === 'river' || currentQuestion.type === 'mountain') return;

            const code = e.target.feature.properties['ISO3166-1-Alpha-3'];
            const gName = nameMapping[e.target.feature.properties.name] || e.target.feature.properties.name;

            checkAnswer(code === currentQuestion.code || gName === currentQuestion.answer, e.target, 'country', gName);
        }

        function clickRiver(e) {
            if (learnActive) { showRiverLearn(e.target); return; }
            if (!quizActive || !currentQuestion || currentQuestion.type !== 'river') return;

            // FIXED: Compare with both raw name and display name
            const clickedRaw = e.target.riverRawName;
            const clickedDisplay = e.target.riverDisplayName;
            const targetRaw = currentQuestion.riverRawName;
            const targetDisplay = currentQuestion.riverDisplayName;

            const isCorrect = clickedRaw === targetRaw ||
                              clickedDisplay === targetDisplay ||
                              clickedRaw === targetDisplay ||
                              clickedDisplay === targetRaw;

            checkAnswer(isCorrect, e.target, 'river', clickedDisplay);
        }

        function clickMountain(e) {
            if (learnActive) { showMountainLearn(e.target); return; }
            if (!quizActive || !currentQuestion || currentQuestion.type !== 'mountain') return;

            const isCorrect = e.target.mtData.name === currentQuestion.answer;
            checkAnswer(isCorrect, e.target, 'mountain', e.target.mtData.name);
        }

        // ========== QUIZ LOGIC ==========
        function startQuiz() {
            quizActive = true; learnActive = false;
            qIndex = 0; score = 0; streak = 0; correct = 0; wrong = 0; hints = 0;
            used = []; wrongAnswers = [];
            resetHighlights();
            updateStats();

            document.getElementById('startBtn').textContent = '⏹️ Stop';
            document.getElementById('startBtn').onclick = endQuiz;
            document.getElementById('hintBtn').disabled = false;
            document.getElementById('skipBtn').disabled = false;
            document.getElementById('learnBtn').style.display = 'none';
            document.getElementById('modePanel').classList.add('collapsed');
            document.getElementById('collapseBtn').textContent = '▶';

            nextQuestion();
        }

        function getCountries() {
            return currentRegion === 'world' ? Object.values(countriesDB).flat() : (countriesDB[currentRegion] || []);
        }

        function nextQuestion() {
            if (qIndex >= totalQ) { endQuiz(); return; }
            resetHighlights();
            hideHint(); hideMnemonic();

            document.getElementById('qBadge').textContent = `${qIndex + 1}/${totalQ}`;
            document.getElementById('progressTxt').textContent = `${qIndex}/${totalQ}`;
            document.getElementById('progressFill').style.width = `${(qIndex/totalQ)*100}%`;

            const modes = currentMode === 'mixed' ? ['countries','capitals','flags','rivers','mountains'] : [currentMode];
            const mode = modes[Math.floor(Math.random() * modes.length)];

            switch(mode) {
                case 'countries': qCountry(); break;
                case 'capitals': qCapital(); break;
                case 'flags': qFlag(); break;
                case 'rivers': qRiver(); break;
                case 'mountains': qMountain(); break;
            }
        }

        function qCountry(depth) {
            depth = (depth || 0) + 1;
            const list = getCountries().filter(c => !used.includes('c_'+c.name));
            if (!list.length) { used = used.filter(u => !u.startsWith('c_')); if (depth > 2) { endQuiz(); return; } return qCountry(depth); }
            const c = list[Math.floor(Math.random() * list.length)];
            used.push('c_'+c.name);
            currentQuestion = { type:'country', answer:c.name, code:c.code, hint:`Hauptstadt: ${c.capital}`, mnemonic:c.mnemonic, data:c };
            document.getElementById('qMode').textContent = '🗺️ Länder';
            document.getElementById('qText').innerHTML = `Klicke auf <span class="hl">${c.name}</span>!`;
            zoomRegion();
        }

        function qCapital(depth) {
            depth = (depth || 0) + 1;
            const list = getCountries().filter(c => !used.includes('cap_'+c.capital));
            if (!list.length) { used = used.filter(u => !u.startsWith('cap_')); if (depth > 2) { endQuiz(); return; } return qCapital(depth); }
            const c = list[Math.floor(Math.random() * list.length)];
            used.push('cap_'+c.capital);
            currentQuestion = { type:'capital', answer:c.name, code:c.code, hint:`Beginnt mit "${c.name[0]}"`, mnemonic:c.mnemonic, data:c };
            document.getElementById('qMode').textContent = '🏛️ Hauptstädte';
            document.getElementById('qText').innerHTML = `<span class="hl">${c.capital}</span> = Hauptstadt von?`;
            zoomRegion();
        }

        function qFlag(depth) {
            depth = (depth || 0) + 1;
            const list = getCountries().filter(c => !used.includes('f_'+c.flag));
            if (!list.length) { used = used.filter(u => !u.startsWith('f_')); if (depth > 2) { endQuiz(); return; } return qFlag(depth); }
            const c = list[Math.floor(Math.random() * list.length)];
            used.push('f_'+c.flag);
            currentQuestion = { type:'flag', answer:c.name, code:c.code, hint:`Hauptstadt: ${c.capital}`, mnemonic:c.mnemonic, data:c };
            document.getElementById('qMode').textContent = '🚩 Flaggen';
            document.getElementById('qText').innerHTML = `Welches Land?<span class="flag-big">${c.flag}</span>`;
            zoomRegion();
        }

        function qRiver(depth) {
            depth = (depth || 0) + 1;
            const available = allRivers.filter(r => !used.includes('r_'+r.rawName));
            if (!available.length) {
                used = used.filter(u => !u.startsWith('r_'));
                if (allRivers.length === 0) { qCountry(); return; }
                if (depth > 2) { endQuiz(); return; }
                return qRiver(depth);
            }

            const r = available[Math.floor(Math.random() * available.length)];
            used.push('r_'+r.rawName);

            currentQuestion = {
                type: 'river',
                answer: r.displayName,
                riverRawName: r.rawName,
                riverDisplayName: r.displayName,
                hint: r.info.hint,
                mnemonic: r.info.mnemonic,
                layer: r.layer,
                info: r.info
            };

            document.getElementById('qMode').textContent = '🌊 Flüsse';
            document.getElementById('qText').innerHTML = `Klicke auf den <span class="hl">${r.displayName}</span>!`;

            // Zoom to river
            try {
                map.fitBounds(r.layer.getBounds(), { padding: [50, 50], maxZoom: 5 });
            } catch(e) {
                zoomRegion();
            }
        }

        function qMountain(depth) {
            depth = (depth || 0) + 1;
            const available = mountainsData.filter(m => !used.includes('m_'+m.name));
            if (!available.length) { used = used.filter(u => !u.startsWith('m_')); if (depth > 2) { endQuiz(); return; } return qMountain(depth); }

            const m = available[Math.floor(Math.random() * available.length)];
            used.push('m_'+m.name);

            // Find layer
            let mtLayer = null;
            mountainsLayer.eachLayer(l => { if (l.mtData && l.mtData.name === m.name) mtLayer = l; });

            currentQuestion = { type:'mountain', answer:m.name, hint:m.hint, mnemonic:m.mnemonic, layer:mtLayer, data:m };
            document.getElementById('qMode').textContent = '⛰️ Gebirge';
            document.getElementById('qText').innerHTML = `Klicke auf die <span class="hl">${m.name}</span>!`;

            if (mtLayer) map.fitBounds(mtLayer.getBounds(), { padding: [50, 50], maxZoom: 5 });
        }

        function checkAnswer(isCorrect, layer, type, clickedName) {
            highlighted.push(layer);

            if (isCorrect) {
                correct++; streak++;
                const pts = Math.max(10 + streak*2 - hints*3, 5);
                score += pts;
                applyStyle(layer, type, true);
                showFeedback(true, `✓ Richtig! +${pts}`);
                if (currentQuestion.mnemonic) showMnemonic(currentQuestion.mnemonic);
                updateStreak();
            } else {
                wrong++; streak = 0;
                wrongAnswers.push({ q: currentQuestion, wrong: clickedName });
                applyStyle(layer, type, false);
                highlightCorrect();
                showFeedback(false, `✗ Falsch! → ${currentQuestion.answer}`);
                if (currentQuestion.mnemonic) showMnemonic(currentQuestion.mnemonic);
                hideStreakBadge();
            }

            updateStats();
            setTimeout(() => { qIndex++; nextQuestion(); }, isCorrect ? 2000 : 3000);
        }

        function applyStyle(layer, type, correct) {
            const col = correct ? '#00ff88' : '#ff6b6b';
            if (type === 'country') layer.setStyle({ fillColor: col, weight: 3, color: col, fillOpacity: 0.7 });
            else if (type === 'river') layer.setStyle({ color: col, weight: 5, opacity: 1 });
            else if (type === 'mountain') layer.setStyle({ fillColor: col, color: col, fillOpacity: 0.6, weight: 3 });
        }

        function highlightCorrect() {
            if (currentQuestion.layer) {
                const l = currentQuestion.layer;
                if (currentQuestion.type === 'river') l.setStyle({ color: '#00d4ff', weight: 5, opacity: 1 });
                else if (currentQuestion.type === 'mountain') l.setStyle({ fillColor: '#00d4ff', color: '#00d4ff', fillOpacity: 0.6, weight: 3 });
                highlighted.push(l);
            } else if (currentQuestion.code) {
                countriesLayer.eachLayer(l => {
                    const lCode = l.feature.properties['ISO3166-1-Alpha-3'];
                    const lName = nameMapping[l.feature.properties.name] || l.feature.properties.name;
                    if (lCode === currentQuestion.code || (lName && lName === currentQuestion.answer)) {
                        l.setStyle({ fillColor: '#00d4ff', weight: 3, color: '#00d4ff', fillOpacity: 0.7 });
                        highlighted.push(l);
                    }
                });
            }
        }

        function showFeedback(ok, msg) {
            const t = document.getElementById('feedbackToast');
            t.textContent = msg;
            t.className = `feedback-toast show ${ok ? 'correct' : 'incorrect'}`;
            setTimeout(() => t.classList.remove('show'), 2500);
        }

        function showMnemonic(text) {
            document.getElementById('mnemonicText').textContent = text;
            document.getElementById('mnemonicBox').classList.add('show');
        }

        function hideMnemonic() {
            document.getElementById('mnemonicBox').classList.remove('show');
        }

        function useHint() {
            if (!currentQuestion) return;
            hints++;
            document.getElementById('hintBox').textContent = '💡 ' + currentQuestion.hint;
            document.getElementById('hintBox').classList.add('show');
        }

        function hideHint() {
            document.getElementById('hintBox').classList.remove('show');
            hints = 0;
        }

        function skipQuestion() {
            if (!quizActive) return;
            streak = 0; wrong++;
            wrongAnswers.push({ q: currentQuestion, wrong: 'Übersprungen' });
            hideStreakBadge();
            highlightCorrect();
            showFeedback(false, `Skip → ${currentQuestion.answer}`);
            if (currentQuestion.mnemonic) showMnemonic(currentQuestion.mnemonic);
            updateStats();
            setTimeout(() => { qIndex++; nextQuestion(); }, 2500);
        }

        function endQuiz() {
            quizActive = false; currentQuestion = null;
            const total = correct + wrong;
            const pct = total > 0 ? Math.round(correct/total*100) : 0;

            let emoji = '🎉', msg = 'Perfekt!';
            if (pct < 30) { emoji = '😅'; msg = 'Weiter üben!'; }
            else if (pct < 50) { emoji = '🤔'; msg = 'Geht besser!'; }
            else if (pct < 70) { emoji = '😊'; msg = 'Gut!'; }
            else if (pct < 90) { emoji = '🎊'; msg = 'Sehr gut!'; }

            document.getElementById('resEmoji').textContent = emoji;
            document.getElementById('resScore').textContent = pct + '%';
            document.getElementById('resMsg').textContent = msg;
            document.getElementById('resCorrect').textContent = correct;
            document.getElementById('resWrong').textContent = wrong;
            document.getElementById('resPoints').textContent = score;

            if (wrongAnswers.length > 0) {
                document.getElementById('weakAreas').style.display = 'block';
                document.getElementById('weakList').innerHTML = wrongAnswers.slice(0,5).map(w =>
                    `<div class="weak-item">${w.q.answer}</div>`
                ).join('');
                document.getElementById('reviewBtn').style.display = 'block';
            } else {
                document.getElementById('weakAreas').style.display = 'none';
                document.getElementById('reviewBtn').style.display = 'none';
            }

            document.getElementById('popupOverlay').classList.add('show');
            resetButtons();
        }

        function closePopup() {
            document.getElementById('popupOverlay').classList.remove('show');
            resetHighlights();
            hideMnemonic();
            document.getElementById('qText').innerHTML = 'Wähle Quiz oder Lernmodus!';
            document.getElementById('qBadge').textContent = 'Bereit';
            document.getElementById('qMode').textContent = '';
            document.getElementById('modePanel').classList.remove('collapsed');
            document.getElementById('collapseBtn').textContent = '▼';
        }

        function reviewWeak() {
            closePopup();
            // Convert wrong answers to learn items
            learnItems = wrongAnswers.map(w => ({
                type: w.q.type,
                data: w.q.data || w.q,
                name: w.q.answer,
                layer: w.q.layer,
                info: w.q.info
            }));
            learnIndex = 0;
            learnActive = true;

            document.getElementById('qBadge').textContent = `Üben 1/${learnItems.length}`;
            document.getElementById('qMode').textContent = '📚 Wiederholen';
            document.getElementById('startBtn').textContent = '⏹️ Stop';
            document.getElementById('startBtn').onclick = endLearn;

            if (learnItems.length > 0) showLearnItem(0);
        }

        // ========== LEARN MODE ==========
        function startLearn() {
            learnActive = true; quizActive = false;
            learnItems = [];

            if (currentMode === 'rivers') {
                allRivers.forEach(r => learnItems.push({ type:'river', layer:r.layer, info:r.info, name:r.displayName }));
            } else if (currentMode === 'mountains') {
                mountainsData.forEach(m => {
                    let layer = null;
                    mountainsLayer.eachLayer(l => { if (l.mtData?.name === m.name) layer = l; });
                    learnItems.push({ type:'mountain', data:m, layer, name:m.name });
                });
            } else {
                getCountries().forEach(c => learnItems.push({ type:'country', data:c, name:c.name }));
            }

            learnItems.sort(() => Math.random() - 0.5);
            learnIndex = 0;

            document.getElementById('modePanel').classList.add('collapsed');
            document.getElementById('qBadge').textContent = `Lernen 1/${learnItems.length}`;
            document.getElementById('qMode').textContent = '📚 Lernmodus';
            document.getElementById('qText').innerHTML = 'Klicke auf Elemente oder nutze Navigation!';

            document.getElementById('learnBtn').style.display = 'none';
            document.getElementById('startBtn').textContent = '⏹️ Stop';
            document.getElementById('startBtn').onclick = endLearn;
            document.getElementById('startBtn').style.display = 'block';
            document.getElementById('hintBtn').disabled = true;
            document.getElementById('skipBtn').disabled = true;

            if (learnItems.length > 0) showLearnItem(0);
        }

        function showLearnItem(idx) {
            if (idx < 0 || idx >= learnItems.length) return;
            learnIndex = idx;
            const item = learnItems[idx];
            document.getElementById('qBadge').textContent = `Lernen ${idx+1}/${learnItems.length}`;

            if (item.type === 'river' && item.layer) {
                try { map.fitBounds(item.layer.getBounds(), { padding: [50,50], maxZoom: 5 }); } catch(e) {}
                showRiverLearn(item.layer);
            } else if (item.type === 'mountain' && item.layer) {
                map.fitBounds(item.layer.getBounds(), { padding: [50,50], maxZoom: 5 });
                showMountainLearn(item.layer);
            } else if (item.type === 'country') {
                showCountryLearnDirect(item.data);
            }
        }

        function learnNext() {
            if (learnIndex < learnItems.length - 1) showLearnItem(learnIndex + 1);
        }

        function learnPrev() {
            if (learnIndex > 0) showLearnItem(learnIndex - 1);
        }

        function showRiverLearn(layer) {
            const info = layer.riverInfo;
            if (!info) return;
            document.getElementById('infoTitle').innerHTML = `🌊 ${info.de}`;
            document.getElementById('infoSubtitle').textContent = info.length;
            document.getElementById('infoFacts').innerHTML = `
                <div class="info-fact"><span class="info-fact-icon">📏</span>${info.length}</div>
                <div class="info-fact"><span class="info-fact-icon">💡</span>${info.hint}</div>`;
            document.getElementById('infoMnemonicText').textContent = info.mnemonic;
            document.getElementById('infoCard').classList.add('show');
        }

        function showMountainLearn(layer) {
            const m = layer.mtData;
            if (!m) return;
            document.getElementById('infoTitle').innerHTML = `⛰️ ${m.name}`;
            document.getElementById('infoSubtitle').textContent = m.peak;
            document.getElementById('infoFacts').innerHTML = `
                <div class="info-fact"><span class="info-fact-icon">🏔️</span>${m.peak}</div>
                <div class="info-fact"><span class="info-fact-icon">💡</span>${m.hint}</div>`;
            document.getElementById('infoMnemonicText').textContent = m.mnemonic;
            document.getElementById('infoCard').classList.add('show');
        }

        function showCountryLearn(layer) {
            const code = layer.feature.properties['ISO3166-1-Alpha-3'];
            const gName = nameMapping[layer.feature.properties.name] || layer.feature.properties.name;
            let c = null;
            for (const region of Object.values(countriesDB)) {
                c = region.find(x => x.code === code || x.name === gName);
                if (c) break;
            }
            if (c) {
                showCountryLearnDirect(c);
                map.fitBounds(layer.getBounds(), { padding: [50,50], maxZoom: 5 });
            }
        }

        function showCountryLearnDirect(c) {
            document.getElementById('infoTitle').innerHTML = `${c.flag} ${c.name}`;
            document.getElementById('infoSubtitle').textContent = `Hauptstadt: ${c.capital}`;
            document.getElementById('infoFacts').innerHTML = `
                <div class="info-fact"><span class="info-fact-icon">🏛️</span>${c.capital}</div>`;
            document.getElementById('infoMnemonicText').textContent = c.mnemonic || 'Keine Merkhilfe.';
            document.getElementById('infoCard').classList.add('show');
        }

        function closeInfoCard() {
            document.getElementById('infoCard').classList.remove('show');
        }

        function endLearn() {
            learnActive = false;
            document.getElementById('infoCard').classList.remove('show');
            document.getElementById('qText').innerHTML = 'Wähle Quiz oder Lernmodus!';
            document.getElementById('qBadge').textContent = 'Bereit';
            document.getElementById('qMode').textContent = '';
            resetButtons();
        }

        // ========== UI HELPERS ==========
        function updateStats() {
            document.getElementById('statScore').textContent = score;
            document.getElementById('statStreak').textContent = streak;
            document.getElementById('statCorrect').textContent = correct;
            document.getElementById('statWrong').textContent = wrong;
        }

        function updateStreak() {
            if (streak >= 3) {
                document.getElementById('streakNum').textContent = streak;
                document.getElementById('streakBadge').classList.add('show');
            }
        }

        function hideStreakBadge() {
            document.getElementById('streakBadge').classList.remove('show');
        }

        function resetHighlights() {
            highlighted = [];
            if (countriesLayer) countriesLayer.eachLayer(l =>
                l.setStyle({ fillColor: '#152238', weight: 1, color: '#2a4a6a', fillOpacity: 0.65 }));
            if (riversLayer) riversLayer.eachLayer(l =>
                l.setStyle({ color: '#00bfff', weight: 2.5, opacity: 0.75 }));
            if (mountainsLayer) mountainsLayer.eachLayer(l =>
                l.setStyle({ color: '#cd853f', weight: 2, fillColor: '#8b4513', fillOpacity: 0.35 }));
        }

        function resetButtons() {
            document.getElementById('startBtn').textContent = '🎯 Quiz';
            document.getElementById('startBtn').onclick = startQuiz;
            document.getElementById('hintBtn').disabled = true;
            document.getElementById('skipBtn').disabled = true;
            updateTabUI();
        }

        function setTab(tab) {
            currentTab = tab;
            document.getElementById('tabQuiz').classList.toggle('active', tab === 'quiz');
            document.getElementById('tabLearn').classList.toggle('active', tab === 'learn');
            document.getElementById('learnOptions').style.display = tab === 'learn' ? 'block' : 'none';
            updateTabUI();
        }

        function updateTabUI() {
            if (currentTab === 'quiz') {
                document.getElementById('startBtn').style.display = 'block';
                document.getElementById('learnBtn').style.display = 'none';
                document.getElementById('hintBtn').style.display = 'block';
                document.getElementById('skipBtn').style.display = 'block';
            } else {
                document.getElementById('startBtn').style.display = 'none';
                document.getElementById('learnBtn').style.display = 'block';
                document.getElementById('hintBtn').style.display = 'none';
                document.getElementById('skipBtn').style.display = 'none';
            }
        }

        function toggleModePanel() {
            const p = document.getElementById('modePanel');
            p.classList.toggle('collapsed');
            document.getElementById('collapseBtn').textContent = p.classList.contains('collapsed') ? '▶' : '▼';
        }

        function setMode(mode, btn) {
            currentMode = mode;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        function setRegion(region) {
            currentRegion = region;
            zoomRegion();
        }

        function zoomRegion() {
            const v = {
                world: [[25,0], 2], europe: [[54,15], 4], asia: [[35,90], 3],
                africa: [[5,20], 3], northAmerica: [[45,-100], 3],
                southAmerica: [[-15,-60], 3], oceania: [[-25,140], 4]
            };
            const [c, z] = v[currentRegion] || v.world;
            map.setView(c, z);
        }

        function resetView() { zoomRegion(); }

        function toggleRivers() {
            if (!riversLayer) return;
            showRiversFlag = !showRiversFlag;
            const btn = document.getElementById('toggleRivers');
            if (showRiversFlag) { map.addLayer(riversLayer); btn.classList.add('active'); }
            else { map.removeLayer(riversLayer); btn.classList.remove('active'); }
        }

        function toggleMountains() {
            if (!mountainsLayer) return;
            showMountainsFlag = !showMountainsFlag;
            const btn = document.getElementById('toggleMountains');
            if (showMountainsFlag) { map.addLayer(mountainsLayer); btn.classList.add('active'); }
            else { map.removeLayer(mountainsLayer); btn.classList.remove('active'); }
        }

        document.addEventListener('DOMContentLoaded', initMap);

        document.addEventListener('keydown', function(e) {
            if (learnActive) {
                if (e.key === 'ArrowRight') { learnNext(); e.preventDefault(); }
                else if (e.key === 'ArrowLeft') { learnPrev(); e.preventDefault(); }
                else if (e.key === 'Escape') { closeInfoCard(); e.preventDefault(); }
            }
        });
    
