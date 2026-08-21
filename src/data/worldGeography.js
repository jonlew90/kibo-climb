// Static Geography Dataset for Kibo World (100% Undisputed Global Geography)

export const CONTINENTS = [
  {
    id: 'asia',
    name: 'Asia',
    areaRank: 1,
    popRank: 1,
    hemispheres: ['Northern', 'Eastern'],
    notableFeature: 'Largest and most populous continent on Earth',
    highestPoint: 'Mount Everest',
    lowestPoint: 'Dead Sea',
    longestRiver: 'Yangtze River',
    largestDesert: 'Arabian Desert',
    largestLake: 'Caspian Sea',
    countryCount: 'Over 48 sovereign nations'
  },
  {
    id: 'africa',
    name: 'Africa',
    areaRank: 2,
    popRank: 2,
    hemispheres: ['Northern', 'Southern', 'Eastern'],
    notableFeature: 'Home to the Sahara Desert and the Nile River',
    highestPoint: 'Mount Kilimanjaro',
    lowestPoint: 'Lake Assal',
    longestRiver: 'Nile River',
    largestDesert: 'Sahara Desert',
    largestLake: 'Lake Victoria',
    countryCount: '54 sovereign nations'
  },
  {
    id: 'north_america',
    name: 'North America',
    areaRank: 3,
    popRank: 4,
    hemispheres: ['Northern', 'Western'],
    notableFeature: 'Home to the United States, Canada, Mexico, and the Great Lakes',
    highestPoint: 'Denali',
    lowestPoint: 'Death Valley (Badwater Basin)',
    longestRiver: 'Missouri-Mississippi River System',
    largestDesert: 'Great Basin Desert',
    largestLake: 'Lake Superior',
    countryCount: '23 sovereign nations'
  },
  {
    id: 'south_america',
    name: 'South America',
    areaRank: 4,
    popRank: 5,
    hemispheres: ['Southern', 'Western'],
    notableFeature: 'Home to the Amazon Rainforest and the Andes Mountains',
    highestPoint: 'Aconcagua',
    lowestPoint: 'Laguna del Carbón',
    longestRiver: 'Amazon River',
    largestDesert: 'Patagonian Desert',
    largestLake: 'Lake Titicaca',
    countryCount: '12 sovereign nations'
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    areaRank: 5,
    popRank: 7,
    hemispheres: ['Southern'],
    notableFeature: 'Coldest, driest, and windiest continent, covered almost entirely in ice',
    highestPoint: 'Vinson Massif',
    lowestPoint: 'Deep Lake (Vestfold Hills)',
    longestRiver: 'Onyx River (meltwater stream)',
    largestDesert: 'Antarctic Polar Desert (largest desert on Earth)',
    countryCount: '0 permanent sovereign countries'
  },
  {
    id: 'europe',
    name: 'Europe',
    areaRank: 6,
    popRank: 3,
    hemispheres: ['Northern', 'Eastern'],
    notableFeature: 'Second smallest continent by land area, bordered by Arctic and Atlantic oceans',
    highestPoint: 'Mount Elbrus',
    lowestPoint: 'Caspian Sea Shore',
    longestRiver: 'Volga River',
    largestLake: 'Lake Ladoga',
    countryCount: '44 sovereign nations'
  },
  {
    id: 'australia',
    name: 'Australia',
    areaRank: 7,
    popRank: 6,
    hemispheres: ['Southern', 'Eastern'],
    notableFeature: 'Smallest continent, completely surrounded by water (island continent)',
    highestPoint: 'Mount Kosciuszko',
    lowestPoint: 'Lake Eyre (Kati Thanda)',
    longestRiver: 'Murray River',
    largestDesert: 'Great Victoria Desert',
    coralReef: 'Great Barrier Reef'
  }
];

export const OCEANS = [
  {
    id: 'pacific',
    name: 'Pacific',
    fullName: 'Pacific Ocean',
    sizeRank: 1,
    deepestPoint: 'Mariana Trench (Challenger Deep)',
    deepestTrench: 'Mariana Trench',
    notableFeature: 'Largest and deepest ocean on Earth, covering over 30% of planetary surface',
    borderingContinents: ['Asia', 'Australia', 'North America', 'South America']
  },
  {
    id: 'atlantic',
    name: 'Atlantic',
    fullName: 'Atlantic Ocean',
    sizeRank: 2,
    deepestPoint: 'Puerto Rico Trench (Milwaukee Deep)',
    deepestTrench: 'Puerto Rico Trench',
    notableFeature: 'Second largest ocean, separates the Americas from Europe and Africa',
    borderingContinents: ['North America', 'South America', 'Europe', 'Africa']
  },
  {
    id: 'indian',
    name: 'Indian',
    fullName: 'Indian Ocean',
    sizeRank: 3,
    deepestPoint: 'Java Trench (Sunda Trench)',
    deepestTrench: 'Java Trench',
    notableFeature: 'Third largest ocean and warmest ocean on Earth, bounded by Asia, Africa, and Australia',
    borderingContinents: ['Africa', 'Asia', 'Australia']
  },
  {
    id: 'southern',
    name: 'Southern',
    fullName: 'Southern Ocean',
    sizeRank: 4,
    deepestPoint: 'South Sandwich Trench (Factorian Deep)',
    deepestTrench: 'South Sandwich Trench',
    notableFeature: 'Fourth largest ocean, completely encircles the continent of Antarctica',
    borderingContinents: ['Antarctica']
  },
  {
    id: 'arctic',
    name: 'Arctic',
    fullName: 'Arctic Ocean',
    sizeRank: 5,
    deepestPoint: 'Molloy Deep (Fram Strait)',
    deepestTrench: 'Molloy Deep',
    notableFeature: 'Smallest and shallowest ocean, centered on the North Pole and covered by sea ice',
    borderingContinents: ['North America', 'Europe', 'Asia']
  }
];

export const CARDINAL_DIRECTIONS = [
  { direction: 'North', opposite: 'South', mapPosition: 'top', hint: 'Points toward the top of a standard map.' },
  { direction: 'South', opposite: 'North', mapPosition: 'bottom', hint: 'Points toward the bottom of a standard map.' },
  { direction: 'East', opposite: 'West', mapPosition: 'right', hint: 'Points toward the right of a standard map, where the sun rises.' },
  { direction: 'West', opposite: 'East', mapPosition: 'left', hint: 'Points toward the left of a standard map, where the sun sets.' },
  { direction: 'Northeast', opposite: 'Southwest', mapPosition: 'top-right', hint: 'The direction halfway between North and East.' },
  { direction: 'Northwest', opposite: 'Southeast', mapPosition: 'top-left', hint: 'The direction halfway between North and West.' },
  { direction: 'Southeast', opposite: 'Northwest', mapPosition: 'bottom-right', hint: 'The direction halfway between South and East.' },
  { direction: 'Southwest', opposite: 'Northeast', mapPosition: 'bottom-left', hint: 'The direction halfway between South and West.' }
];

export const GEOGRAPHIC_FOUNDATIONS = [
  {
    concept: 'Equator',
    description: 'The imaginary line around the middle of Earth at 0° latitude dividing the Northern and Southern Hemispheres.',
    category: 'latitude'
  },
  {
    concept: 'Prime Meridian',
    description: 'The imaginary line at 0° longitude dividing the Eastern and Western Hemispheres, passing through Greenwich, England.',
    category: 'longitude'
  },
  {
    concept: 'Tropic of Cancer',
    description: 'The parallel of latitude roughly 23.5° North of the Equator, marking the northernmost boundary of the tropics.',
    category: 'latitude'
  },
  {
    concept: 'Tropic of Capricorn',
    description: 'The parallel of latitude roughly 23.5° South of the Equator, marking the southernmost boundary of the tropics.',
    category: 'latitude'
  },
  {
    concept: 'Arctic Circle',
    description: 'The parallel of latitude at approximately 66.5° North, marking the boundary of the polar region where the midnight sun occurs.',
    category: 'latitude'
  },
  {
    concept: 'Antarctic Circle',
    description: 'The parallel of latitude at approximately 66.5° South, marking the boundary of the Southern polar region.',
    category: 'latitude'
  },
  {
    concept: 'International Date Line',
    description: 'An imaginary line roughly along 180° longitude where the calendar day officially transitions forward or backward.',
    category: 'longitude'
  },
  {
    concept: 'Northern Hemisphere',
    description: 'The half of Earth that lies north of the Equator, containing Europe, North America, and most of Asia.',
    category: 'hemisphere'
  },
  {
    concept: 'Southern Hemisphere',
    description: 'The half of Earth that lies south of the Equator, containing Antarctica, Australia, and most of South America.',
    category: 'hemisphere'
  },
  {
    concept: 'Eastern Hemisphere',
    description: 'The half of Earth that lies east of the Prime Meridian and west of the 180th meridian (Europe, Asia, Africa, Australia).',
    category: 'hemisphere'
  },
  {
    concept: 'Western Hemisphere',
    description: 'The half of Earth that lies west of the Prime Meridian, encompassing the Americas.',
    category: 'hemisphere'
  }
];

export const MAJOR_SEAS_AND_WATERBODIES = [
  { name: 'Mediterranean Sea', ocean: 'Atlantic Ocean', location: 'Between Europe, Africa, and Asia', fact: 'Connected to the Atlantic Ocean via the narrow Strait of Gibraltar.' },
  { name: 'Caribbean Sea', ocean: 'Atlantic Ocean', location: 'Between North and South America', fact: 'Tropical sea famous for thousands of coral reefs and islands.' },
  { name: 'Red Sea', ocean: 'Indian Ocean', location: 'Between Africa and the Arabian Peninsula', fact: 'Inlet of the Indian Ocean connected to the Mediterranean Sea by the Suez Canal.' },
  { name: 'Baltic Sea', ocean: 'Atlantic Ocean', location: 'Northern Europe', fact: 'Brackish inland sea surrounded by Scandinavian and Baltic nations.' },
  { name: 'Black Sea', ocean: 'Atlantic Ocean', location: 'Between Southeastern Europe and Western Asia', fact: 'Connected to the Sea of Marmara by the historic Bosphorus Strait.' },
  { name: 'Coral Sea', ocean: 'Pacific Ocean', location: 'Northeast coast of Australia', fact: 'Home to the Great Barrier Reef, the largest coral reef system on Earth.' },
  { name: 'Arabian Sea', ocean: 'Indian Ocean', location: 'Northern Indian Ocean bounded by India, Pakistan, and the Arabian Peninsula', fact: 'Key historic maritime trade route connecting the Middle East with India.' },
  { name: 'North Sea', ocean: 'Atlantic Ocean', location: 'Between the UK, Scandinavia, and mainland Western Europe', fact: 'Marginal sea of the Atlantic Ocean rich in oil, gas, and renewable wind energy.' },
  { name: 'Gulf of Mexico', ocean: 'Atlantic Ocean', location: 'Bordered by the United States, Mexico, and Cuba', fact: 'Ninth largest body of water in the world and origin of the Gulf Stream.' },
  { name: 'Hudson Bay', ocean: 'Arctic / Atlantic Ocean', location: 'Northeastern Canada', fact: 'Large inland saltwater bay with the longest shoreline of any bay in Canada.' },
  { name: 'Persian Gulf', ocean: 'Indian Ocean', location: 'Between Iran and the Arabian Peninsula', fact: 'Strategic waterway connected to the Gulf of Oman via the Strait of Hormuz.' },
  { name: 'Bering Sea', ocean: 'Pacific Ocean', location: 'Between Alaska and Russia', fact: 'Separates North America from Asia at the Bering Strait.' },
  { name: 'South China Sea', ocean: 'Pacific Ocean', location: 'Southeast Asia', fact: 'Crucial global shipping route connecting the Pacific and Indian oceans.' },
  { name: 'Tasman Sea', ocean: 'Pacific Ocean', location: 'Between Australia and New Zealand', fact: 'Marginal sea separating Australia from New Zealand.' }
];

export const US_STATES = [
  { name: 'Alabama', capital: 'Montgomery', region: 'South', nickname: 'Yellowhammer State', trivia: 'Home to the US Space & Rocket Center in Huntsville' },
  { name: 'Alaska', capital: 'Juneau', region: 'West', nickname: 'The Last Frontier', trivia: 'Largest US state by land area, home to Denali', shapeSvg: 'M72,18 L128,22 L128,68 L136,78 L148,92 L144,112 L136,94 L126,78 L116,84 L104,78 L96,86 L92,80 L82,84 L68,96 L54,106 L38,114 L24,118 L12,122 L14,118 L26,114 L42,108 L56,98 L60,84 L48,72 L58,62 L46,52 L58,44 L48,38 L58,32 L62,22 Z M100,92 A4,3 0 1,0 108,92 A4,3 0 1,0 100,92' },
  { name: 'Arizona', capital: 'Phoenix', region: 'West', nickname: 'Grand Canyon State', trivia: 'Home to the Grand Canyon and Saguaro cactus' },
  { name: 'Arkansas', capital: 'Little Rock', region: 'South', nickname: 'Natural State', trivia: 'Known for the Ozark Mountains and Hot Springs National Park' },
  { name: 'California', capital: 'Sacramento', region: 'West', nickname: 'Golden State', trivia: 'Most populous US state, home to Yosemite and Death Valley', shapeSvg: 'M56,18 L108,18 L98,48 L146,96 L150,124 L114,124 L104,114 L88,102 L74,76 L68,62 L50,36 Z M76,108 A2.5,2.5 0 1,0 81,108 A2.5,2.5 0 1,0 76,108 M84,114 A2,2 0 1,0 88,114 A2,2 0 1,0 84,114' },
  { name: 'Colorado', capital: 'Denver', region: 'West', nickname: 'Centennial State', trivia: 'Known for the Rocky Mountains and the Mile High City', shapeSvg: 'M55,35 L145,35 L145,105 L55,105 Z' },
  { name: 'Connecticut', capital: 'Hartford', region: 'Northeast', nickname: 'Constitution State', trivia: 'Southernmost state in the New England region' },
  { name: 'Delaware', capital: 'Dover', region: 'South', nickname: 'First State', trivia: 'First state to ratify the United States Constitution in 1787' },
  { name: 'Florida', capital: 'Tallahassee', region: 'South', nickname: 'Sunshine State', trivia: 'Peninsula state known for the Everglades, keys, and Kennedy Space Center', shapeSvg: 'M34,38 L54,38 L86,36 L124,36 L138,64 L136,92 L132,110 L126,118 L114,122 L102,122 L94,120 L96,116 L108,118 L118,114 L112,102 L102,78 L92,58 L86,50 L72,46 L48,42 L34,48 Z' },
  { name: 'Georgia', capital: 'Atlanta', region: 'South', nickname: 'Peach State', trivia: 'Largest US state by land area east of the Mississippi River' },
  { name: 'Hawaii', capital: 'Honolulu', region: 'West', nickname: 'Aloha State', trivia: 'Only US state composed entirely of islands in the tropical Pacific Ocean', shapeSvg: 'M26,38 A6,5 0 1,0 38,38 A6,5 0 1,0 26,38 M18,44 A2.5,2 0 1,0 23,44 A2.5,2 0 1,0 18,44 M62,50 L76,46 L82,54 L72,60 L60,56 Z M94,60 L110,58 L108,64 L94,64 Z M96,68 L104,66 L102,74 L94,72 Z M112,66 L124,62 L132,70 L126,80 L116,76 Z M148,88 L168,82 L180,98 L174,122 L154,126 L142,108 Z' },
  { name: 'Idaho', capital: 'Boise', region: 'West', nickname: 'Gem State', trivia: 'Famous for producing potatoes and rugged wilderness mountains' },
  { name: 'Illinois', capital: 'Springfield', region: 'Midwest', nickname: 'Prairie State', trivia: 'Home to Chicago on Lake Michigan and Lincoln heritage' },
  { name: 'Indiana', capital: 'Indianapolis', region: 'Midwest', nickname: 'Hoosier State', trivia: 'Home to the Indianapolis 500 motor race' },
  { name: 'Iowa', capital: 'Des Moines', region: 'Midwest', nickname: 'Hawkeye State', trivia: 'Located between the Mississippi and Missouri rivers' },
  { name: 'Kansas', capital: 'Topeka', region: 'Midwest', nickname: 'Sunflower State', trivia: 'Geographic center of the 48 contiguous United States' },
  { name: 'Kentucky', capital: 'Frankfort', region: 'South', nickname: 'Bluegrass State', trivia: 'Home to Mammoth Cave, the longest cave system in the world' },
  { name: 'Louisiana', capital: 'Baton Rouge', region: 'South', nickname: 'Pelican State', trivia: 'Located at the mouth of the Mississippi River, famous for bayous and New Orleans' },
  { name: 'Maine', capital: 'Augusta', region: 'Northeast', nickname: 'Pine Tree State', trivia: 'Northeasternmost US state, famous for rocky Atlantic coastline and lighthouses' },
  { name: 'Maryland', capital: 'Annapolis', region: 'South', nickname: 'Old Line State', trivia: 'Surrounds the Chesapeake Bay and home to the US Naval Academy' },
  { name: 'Massachusetts', capital: 'Boston', region: 'Northeast', nickname: 'Bay State', trivia: 'Cradle of the American Revolution and home to Cape Cod' },
  { name: 'Michigan', capital: 'Lansing', region: 'Midwest', nickname: 'Great Lakes State', trivia: 'Composed of two peninsulas bordered by four of the five Great Lakes', shapeSvg: 'M66,44 L74,24 L94,32 L122,28 L114,42 L80,48 Z M114,46 L136,68 L138,76 L132,108 L82,114 L82,92 L98,54 Z' },
  { name: 'Minnesota', capital: 'St. Paul', region: 'Midwest', nickname: 'North Star State', trivia: 'Known as the Land of 10,000 Lakes and source of the Mississippi River' },
  { name: 'Mississippi', capital: 'Jackson', region: 'South', nickname: 'Magnolia State', trivia: 'Named after the mighty Mississippi River along its western border' },
  { name: 'Missouri', capital: 'Jefferson City', region: 'Midwest', nickname: 'Show-Me State', trivia: 'Home to the Gateway Arch in St. Louis marking the gateway to the west' },
  { name: 'Montana', capital: 'Helena', region: 'West', nickname: 'Treasure State', trivia: 'Known as Big Sky Country and home to Glacier National Park' },
  { name: 'Nebraska', capital: 'Lincoln', region: 'Midwest', nickname: 'Cornhusker State', trivia: 'The only US state with a unicameral state legislature' },
  { name: 'Nevada', capital: 'Carson City', region: 'West', nickname: 'Silver State', trivia: 'Driest state in the US, located within the Great Basin desert' },
  { name: 'New Hampshire', capital: 'Concord', region: 'Northeast', nickname: 'Granite State', trivia: 'Home to Mount Washington in the scenic White Mountains' },
  { name: 'New Jersey', capital: 'Trenton', region: 'Northeast', nickname: 'Garden State', trivia: 'Most densely populated US state, bordered by Atlantic Ocean and Hudson River' },
  { name: 'New Mexico', capital: 'Santa Fe', region: 'West', nickname: 'Land of Enchantment', trivia: 'Santa Fe is the oldest state capital in the United States (founded 1610)' },
  { name: 'New York', capital: 'Albany', region: 'Northeast', nickname: 'Empire State', trivia: 'Home to New York City, Niagara Falls, and the Adirondack Mountains', shapeSvg: 'M78,32 L114,18 L134,18 L136,56 L138,82 L136,96 L132,102 L148,104 L176,106 L152,112 L130,108 L118,92 L52,92 L42,82 L42,70 L72,54 Z' },
  { name: 'North Carolina', capital: 'Raleigh', region: 'South', nickname: 'Tar Heel State', trivia: 'Site of the Wright brothers first powered airplane flight at Kitty Hawk' },
  { name: 'North Dakota', capital: 'Bismarck', region: 'Midwest', nickname: 'Peace Garden State', trivia: 'Northern Great Plains state bordering Canada' },
  { name: 'Ohio', capital: 'Columbus', region: 'Midwest', nickname: 'Buckeye State', trivia: 'Known as the Birthplace of Aviation and bordered by Lake Erie' },
  { name: 'Oklahoma', capital: 'Oklahoma City', region: 'South', nickname: 'Sooner State', trivia: 'Features a distinct western panhandle and rich Native American heritage' },
  { name: 'Oregon', capital: 'Salem', region: 'West', nickname: 'Beaver State', trivia: 'Pacific Northwest state home to Crater Lake, the deepest lake in the US' },
  { name: 'Pennsylvania', capital: 'Harrisburg', region: 'Northeast', nickname: 'Keystone State', trivia: 'Birthplace of the Declaration of Independence and Constitution in Philadelphia' },
  { name: 'Rhode Island', capital: 'Providence', region: 'Northeast', nickname: 'Ocean State', trivia: 'Smallest US state by land area, renowned for Newport sailing' },
  { name: 'South Carolina', capital: 'Columbia', region: 'South', nickname: 'Palmetto State', trivia: 'Historic Atlantic coastal state home to Charleston and Fort Sumter' },
  { name: 'South Dakota', capital: 'Pierre', region: 'Midwest', nickname: 'Mount Rushmore State', trivia: 'Home to the colossal granite carvings of Mount Rushmore in the Black Hills' },
  { name: 'Tennessee', capital: 'Nashville', region: 'South', nickname: 'Volunteer State', trivia: 'Famous for the Great Smoky Mountains, country music capital Nashville, and Memphis' },
  { name: 'Texas', capital: 'Austin', region: 'South', nickname: 'Lone Star State', trivia: 'Second largest US state by both area and population', shapeSvg: 'M58,20 L88,20 L88,38 L132,38 L136,72 L138,92 L128,102 L118,114 L108,126 L98,136 L84,122 L68,96 L54,102 L42,94 L24,68 L24,48 L58,48 Z' },
  { name: 'Utah', capital: 'Salt Lake City', region: 'West', nickname: 'Beehive State', trivia: 'Home to the Great Salt Lake and the Mighty 5 national parks (Zion, Bryce, Arches)' },
  { name: 'Vermont', capital: 'Montpelier', region: 'Northeast', nickname: 'Green Mountain State', trivia: 'Top maple syrup producer in the US and home to the Green Mountains' },
  { name: 'Virginia', capital: 'Richmond', region: 'South', nickname: 'Old Dominion', trivia: 'Birthplace of eight US presidents, bordered by Chesapeake Bay' },
  { name: 'Washington', capital: 'Olympia', region: 'West', nickname: 'Evergreen State', trivia: 'Pacific Northwest state home to Mount Rainier, Puget Sound, and Seattle' },
  { name: 'West Virginia', capital: 'Charleston', region: 'South', nickname: 'Mountain State', trivia: 'The only US state located completely within the Appalachian mountain region' },
  { name: 'Wisconsin', capital: 'Madison', region: 'Midwest', nickname: 'Badger State', trivia: 'Famous for dairy production and bordered by both Lake Superior and Lake Michigan' },
  { name: 'Wyoming', capital: 'Cheyenne', region: 'West', nickname: 'Equality State', trivia: 'Least populous US state, home to Yellowstone and Grand Teton National Parks', shapeSvg: 'M55,35 L145,35 L145,95 L55,95 Z' }
];

export const COUNTRIES = [
  // North America
  { name: 'United States', capital: 'Washington, D.C.', continent: 'North America', landmark: 'Statue of Liberty', trivia: 'Third largest country by land area and population' },
  { name: 'Canada', capital: 'Ottawa', continent: 'North America', landmark: 'Niagara Falls', trivia: 'Second largest country in the world by total area with the longest coastline' },
  { name: 'Mexico', capital: 'Mexico City', continent: 'North America', landmark: 'Chichen Itza', trivia: 'Cradle of Aztec and Mayan civilizations, bordered by Pacific and Gulf of Mexico', shapeSvg: 'M24,32 L40,32 L48,54 L54,76 L48,92 L42,98 L38,96 L42,78 L34,56 L22,38 Z M44,32 L80,26 L98,38 L112,34 L132,44 L126,60 L134,78 L146,84 L155,80 L158,64 L172,58 L178,64 L176,78 L170,84 L156,88 L148,102 L140,106 L124,98 L105,92 L86,78 L68,62 L56,44 Z' },
  { name: 'Cuba', capital: 'Havana', continent: 'North America', landmark: 'Old Havana', trivia: 'Largest island country in the Caribbean Sea' },
  { name: 'Jamaica', capital: 'Kingston', continent: 'North America', landmark: 'Blue Mountains', trivia: 'Island nation in the Caribbean renowned for reggae music and Blue Mountain coffee' },
  { name: 'Costa Rica', capital: 'San José', continent: 'North America', landmark: 'Arenal Volcano', trivia: 'Central American nation with no standing military, home to incredible biodiversity' },
  { name: 'Panama', capital: 'Panama City', continent: 'North America', landmark: 'Panama Canal', trivia: 'Isthmus country connecting North and South America, home to the Panama Canal' },
  { name: 'Guatemala', capital: 'Guatemala City', continent: 'North America', landmark: 'Tikal Mayan Ruins', trivia: 'Heart of the ancient Mayan civilization in Central America' },
  { name: 'Dominican Republic', capital: 'Santo Domingo', continent: 'North America', landmark: 'Colonial City of Santo Domingo', trivia: 'Shares the island of Hispaniola with Haiti' },
  { name: 'Haiti', capital: 'Port-au-Prince', continent: 'North America', landmark: 'Citadelle Laferrière', trivia: 'First independent republic in Latin America and the Caribbean' },
  { name: 'Bahamas', capital: 'Nassau', continent: 'North America', landmark: 'Atlantis Paradise Island', trivia: 'Archipelago of over 700 coral islands in the Atlantic Ocean' },
  { name: 'Belize', capital: 'Belmopan', continent: 'North America', landmark: 'Great Blue Hole', trivia: 'Only Central American country where English is the official language' },

  // South America
  { name: 'Brazil', capital: 'Brasília', continent: 'South America', landmark: 'Christ the Redeemer', trivia: 'Largest country in South America, home to Amazon Rainforest', shapeSvg: 'M122,22 L108,22 L95,24 L78,22 L64,28 L52,38 L45,52 L36,62 L44,74 L58,76 L68,92 L78,98 L84,108 L92,114 L88,122 L96,128 L105,128 L115,120 L126,106 L138,94 L148,82 L155,68 L162,54 L148,38 L136,28 Z' },
  { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', landmark: 'Iguazu Falls', trivia: 'Eighth largest country in the world, home to the Pampas and Patagonia' },
  { name: 'Chile', capital: 'Santiago', continent: 'South America', landmark: 'Easter Island', trivia: 'Longest north-to-south narrow country in the world, home to the Atacama Desert', shapeSvg: 'M82,14 L90,14 L96,24 L95,42 L94,58 L92,80 L94,102 L98,118 L104,132 L96,136 L88,134 L82,124 L86,114 L80,100 L82,82 L80,60 L78,38 L76,22 Z M92,136 L98,138 L94,140 Z' },
  { name: 'Peru', capital: 'Lima', continent: 'South America', landmark: 'Machu Picchu', trivia: 'Heart of the Incan Empire, home to Machu Picchu and Lake Titicaca' },
  { name: 'Colombia', capital: 'Bogotá', continent: 'South America', landmark: 'Coffee Cultural Landscape', trivia: 'Only South American nation with coastlines on both the Pacific Ocean and Caribbean Sea' },
  { name: 'Ecuador', capital: 'Quito', continent: 'South America', landmark: 'Galapagos Islands', trivia: 'Named after the Equator; home to the volcanic Galápagos archipelago' },
  { name: 'Venezuela', capital: 'Caracas', continent: 'South America', landmark: 'Angel Falls', trivia: 'Home to Angel Falls, the world highest uninterrupted waterfall' },
  { name: 'Bolivia', capital: 'Sucre', continent: 'South America', landmark: 'Salar de Uyuni', trivia: 'Landlocked South American nation home to the world largest salt flat' },
  { name: 'Paraguay', capital: 'Asunción', continent: 'South America', landmark: 'Itaipu Dam', trivia: 'Landlocked nation in central South America bordered by Argentina, Brazil, and Bolivia' },
  { name: 'Uruguay', capital: 'Montevideo', continent: 'South America', landmark: 'Punta del Este', trivia: 'Second smallest sovereign nation in South America, located on the Rio de la Plata' },

  // Europe
  { name: 'United Kingdom', capital: 'London', continent: 'Europe', landmark: 'Big Ben', trivia: 'Island nation comprising England, Scotland, Wales, and Northern Ireland', shapeSvg: 'M102,14 L94,16 L88,28 L98,26 L108,24 L114,30 L104,38 L112,48 L118,62 L132,70 L136,82 L126,92 L132,98 L120,102 L108,100 L96,104 L82,108 L84,102 L94,98 L98,92 L86,88 L82,78 L86,70 L94,68 L96,56 L90,44 L92,32 Z M62,48 L76,46 L78,58 L68,62 L60,56 Z M106,8 L112,8 L110,12 Z M82,20 L86,18 L84,26 Z' },
  { name: 'France', capital: 'Paris', continent: 'Europe', landmark: 'Eiffel Tower', trivia: 'Hexagonal shaped country in Western Europe spanning the Atlantic and Mediterranean', shapeSvg: 'M105,22 L94,28 L82,34 L84,42 L54,44 L46,50 L52,58 L66,58 L74,70 L78,92 L76,108 L92,108 L108,110 L122,104 L134,102 L140,96 L138,84 L132,74 L134,66 L128,58 L132,48 L126,38 L118,32 Z M154,104 L160,102 L162,116 L156,118 Z' },
  { name: 'Germany', capital: 'Berlin', continent: 'Europe', landmark: 'Brandenburg Gate', trivia: 'Most populous member state of the European Union, home to the Black Forest' },
  { name: 'Italy', capital: 'Rome', continent: 'Europe', landmark: 'Colosseum', trivia: 'Famous boot-shaped peninsula jutting into Mediterranean Sea', shapeSvg: 'M68,46 L64,32 L74,24 L88,22 L102,22 L114,20 L126,22 L132,28 L128,34 L122,42 L134,60 L148,76 L156,78 L152,84 L166,92 L168,104 L158,106 L148,98 L142,104 L144,114 L136,122 L132,116 L134,106 L126,98 L118,86 L104,72 L92,58 L78,48 Z M112,120 L130,118 L132,128 L118,132 L108,126 Z M56,78 L66,78 L64,102 L54,102 Z' },
  { name: 'Spain', capital: 'Madrid', continent: 'Europe', landmark: 'Sagrada Familia', trivia: 'Occupies most of the Iberian Peninsula with the Balearic and Canary Islands' },
  { name: 'Portugal', capital: 'Lisbon', continent: 'Europe', landmark: 'Belem Tower', trivia: 'Westernmost sovereign state in mainland Europe, bordering the Atlantic Ocean' },
  { name: 'Ireland', capital: 'Dublin', continent: 'Europe', landmark: 'Cliffs of Moher', trivia: 'Known as the Emerald Isle, located west of Great Britain' },
  { name: 'Netherlands', capital: 'Amsterdam', continent: 'Europe', landmark: 'Windmills of Kinderdijk', trivia: 'Famous for canals, tulips, and extensive land reclaimed from the North Sea' },
  { name: 'Belgium', capital: 'Brussels', continent: 'Europe', landmark: 'Grand Place', trivia: 'Headquarters of the European Union and NATO' },
  { name: 'Switzerland', capital: 'Bern', continent: 'Europe', landmark: 'Matterhorn', trivia: 'Alpine nation known for neutrality, chocolate, and the Swiss Alps' },
  { name: 'Austria', capital: 'Vienna', continent: 'Europe', landmark: 'Schönbrunn Palace', trivia: 'Landlocked Central European nation famous for classical music and the Danube' },
  { name: 'Greece', capital: 'Athens', continent: 'Europe', landmark: 'Parthenon (Acropolis)', trivia: 'Cradle of Western civilization and democracy with thousands of Aegean islands' },
  { name: 'Sweden', capital: 'Stockholm', continent: 'Europe', landmark: 'Vasa Museum', trivia: 'Largest Scandinavian nation by area, home to thousands of coastal islands' },
  { name: 'Norway', capital: 'Oslo', continent: 'Europe', landmark: 'Geirangerfjord', trivia: 'Famous for deep coastal fjords, northern lights, and midnight sun' },
  { name: 'Finland', capital: 'Helsinki', continent: 'Europe', landmark: 'Suomenlinna Fortress', trivia: 'Known as the Land of a Thousand Lakes, bordering Sweden, Norway, and Russia' },
  { name: 'Denmark', capital: 'Copenhagen', continent: 'Europe', landmark: 'Little Mermaid Statue', trivia: 'Southernmost Nordic country, comprising the Jutland peninsula and archipelago' },
  { name: 'Poland', capital: 'Warsaw', continent: 'Europe', landmark: 'Wawel Castle', trivia: 'Central European country on the Baltic Sea, home to historic Warsaw and Krakow' },
  { name: 'Iceland', capital: 'Reykjavik', continent: 'Europe', landmark: 'Blue Lagoon', trivia: 'Volcanic island nation located on the Mid-Atlantic Ridge' },
  { name: 'Turkey', capital: 'Ankara', continent: 'Europe', landmark: 'Hagia Sophia', trivia: 'Transcontinental nation bridging Europe and Asia across the Bosphorus Strait' },
  { name: 'Ukraine', capital: 'Kyiv', continent: 'Europe', landmark: 'Saint Sophia Cathedral', trivia: 'Largest country located entirely within the European continent' },
  { name: 'Czech Republic', capital: 'Prague', continent: 'Europe', landmark: 'Charles Bridge', trivia: 'Landlocked country in Central Europe famous for Bohemian castles and Prague' },
  { name: 'Hungary', capital: 'Budapest', continent: 'Europe', landmark: 'Hungarian Parliament Building', trivia: 'Landlocked Central European nation divided by the Danube River in Budapest' },
  { name: 'Romania', capital: 'Bucharest', continent: 'Europe', landmark: 'Bran Castle', trivia: 'Eastern European country home to the Carpathian Mountains and Danube Delta' },
  { name: 'Croatia', capital: 'Zagreb', continent: 'Europe', landmark: 'Dubrovnik Old Town Walls', trivia: 'Famous for its crescent shape, Adriatic coastline, and over a thousand islands' },

  // Asia
  { name: 'Japan', capital: 'Tokyo', continent: 'Asia', landmark: 'Mount Fuji', trivia: 'East Asian archipelago of over 6,800 islands in the Pacific Ring of Fire', shapeSvg: 'M146,14 L172,18 L168,36 L146,38 L140,26 Z M140,40 L158,50 L154,68 L144,82 L132,90 L118,98 L98,104 L84,108 L96,96 L115,84 L132,64 L136,48 Z M96,102 L114,100 L110,112 L94,110 Z M72,104 L88,104 L84,124 L68,124 L66,112 Z M44,128 L50,130 L48,134 Z' },
  { name: 'China', capital: 'Beijing', continent: 'Asia', landmark: 'Great Wall of China', trivia: 'Fourth largest country by area and home to the Yangtze and Yellow rivers' },
  { name: 'India', capital: 'New Delhi', continent: 'Asia', landmark: 'Taj Mahal', trivia: 'South Asian peninsula bounded by Indian Ocean, Arabian Sea, and Bay of Bengal', shapeSvg: 'M68,16 L82,14 L92,22 L102,28 L126,30 L132,28 L138,30 L148,28 L165,26 L168,38 L158,48 L148,46 L142,42 L138,54 L132,68 L122,88 L108,112 L96,126 L88,114 L78,94 L70,74 L54,72 L48,62 L58,56 L52,48 L62,38 Z' },
  { name: 'South Korea', capital: 'Seoul', continent: 'Asia', landmark: 'Gyeongbokgung Palace', trivia: 'East Asian nation on the southern half of the Korean Peninsula' },
  { name: 'Indonesia', capital: 'Jakarta', continent: 'Asia', landmark: 'Borobudur Temple', trivia: 'World largest archipelago nation with over 17,000 islands spanning the Equator' },
  { name: 'Saudi Arabia', capital: 'Riyadh', continent: 'Asia', landmark: 'Al-Masjid an-Nabawi', trivia: 'Occupies most of the Arabian Peninsula, bounded by Red Sea and Persian Gulf' },
  { name: 'Thailand', capital: 'Bangkok', continent: 'Asia', landmark: 'Grand Palace', trivia: 'Southeast Asian kingdom renowned for tropical beaches, temples, and Bangkok' },
  { name: 'Vietnam', capital: 'Hanoi', continent: 'Asia', landmark: 'Ha Long Bay', trivia: 'S-shaped country along the eastern coast of the Indochina Peninsula' },
  { name: 'Philippines', capital: 'Manila', continent: 'Asia', landmark: 'Chocolate Hills', trivia: 'Archipelago nation of over 7,000 islands in the western Pacific Ocean' },
  { name: 'Singapore', capital: 'Singapore', continent: 'Asia', landmark: 'Marina Bay Sands', trivia: 'Island city-state located at the southern tip of the Malay Peninsula' },
  { name: 'Pakistan', capital: 'Islamabad', continent: 'Asia', landmark: 'Badshahi Mosque', trivia: 'South Asian nation along the Indus River, home to K2 peak' },
  { name: 'Bangladesh', capital: 'Dhaka', continent: 'Asia', landmark: 'Sundarbans Mangrove Forest', trivia: 'Home to the world largest river delta (Ganges-Brahmaputra Delta)' },
  { name: 'United Arab Emirates', capital: 'Abu Dhabi', continent: 'Asia', landmark: 'Burj Khalifa (Dubai)', trivia: 'Federation of seven emirates on the Arabian Peninsula, home to Burj Khalifa' },
  { name: 'Israel', capital: 'Jerusalem', continent: 'Asia', landmark: 'Western Wall', trivia: 'Middle Eastern nation on the Mediterranean Sea and home to the Dead Sea' },
  { name: 'Malaysia', capital: 'Kuala Lumpur', continent: 'Asia', landmark: 'Petronas Twin Towers', trivia: 'Divided into Peninsular Malaysia and East Malaysia on the island of Borneo' },
  { name: 'Nepal', capital: 'Kathmandu', continent: 'Asia', landmark: 'Mount Everest Base Camp', trivia: 'Landlocked Himalayan nation home to eight of the world ten highest mountain peaks' },
  { name: 'Mongolia', capital: 'Ulaanbaatar', continent: 'Asia', landmark: 'Genghis Khan Statue', trivia: 'Second largest landlocked country in the world, home to the Gobi Desert' },
  { name: 'Kazakhstan', capital: 'Astana', continent: 'Asia', landmark: 'Baiterek Tower', trivia: 'The largest landlocked country in the world, spanning Central Asia and Eastern Europe' },
  { name: 'Sri Lanka', capital: 'Sri Jayawardenepura Kotte', continent: 'Asia', landmark: 'Sigiriya Rock Fortress', trivia: 'Tear-drop shaped island nation in the Indian Ocean southeast of India' },
  { name: 'Jordan', capital: 'Amman', continent: 'Asia', landmark: 'Petra (Treasury)', trivia: 'Middle Eastern nation home to the ancient rock-carved city of Petra and Dead Sea' },

  // Africa
  { name: 'Egypt', capital: 'Cairo', continent: 'Africa', landmark: 'Pyramids of Giza', trivia: 'Northeast African nation home to the Nile River, Great Sphinx, and Suez Canal', shapeSvg: 'M56,36 L70,38 L86,36 L94,30 L108,30 L118,34 L132,32 L140,42 L134,62 L124,48 L120,40 L124,48 L134,62 L144,76 L148,86 L154,98 L162,118 L56,118 Z' },
  { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', landmark: 'Table Mountain (Cape Town)', trivia: 'Southernmost country in Africa with three official capital cities' },
  { name: 'Nigeria', capital: 'Abuja', continent: 'Africa', landmark: 'Zuma Rock', trivia: 'Most populous country in Africa, situated on the Gulf of Guinea' },
  { name: 'Kenya', capital: 'Nairobi', continent: 'Africa', landmark: 'Maasai Mara', trivia: 'East African nation straddling the Equator, famous for the Great Rift Valley' },
  { name: 'Morocco', capital: 'Rabat', continent: 'Africa', landmark: 'Hassan II Mosque', trivia: 'Northwest African country bordering the Atlantic Ocean and Mediterranean Sea' },
  { name: 'Ghana', capital: 'Accra', continent: 'Africa', landmark: 'Cape Coast Castle', trivia: 'West African nation on the Gulf of Guinea, home to Lake Volta' },
  { name: 'Ethiopia', capital: 'Addis Ababa', continent: 'Africa', landmark: 'Rock-Hewn Churches of Lalibela', trivia: 'Horn of Africa country that maintained independence throughout the colonial era' },
  { name: 'Tanzania', capital: 'Dodoma', continent: 'Africa', landmark: 'Mount Kilimanjaro', trivia: 'Home to Mount Kilimanjaro, the Serengeti, and Ngorongoro Crater' },
  { name: 'Madagascar', capital: 'Antananarivo', continent: 'Africa', landmark: 'Avenue of the Baobabs', trivia: 'Fourth largest island in the world, located off the southeast coast of Africa', shapeSvg: 'M118,16 L132,34 L130,54 L122,88 L102,126 L88,114 L90,84 L96,52 L108,28 Z' },
  { name: 'Algeria', capital: 'Algiers', continent: 'Africa', landmark: 'Sahara Desert Dunes', trivia: 'Largest country in Africa by total land area' },
  { name: 'Senegal', capital: 'Dakar', continent: 'Africa', landmark: 'Gorée Island', trivia: 'Westernmost country on the African mainland' },
  { name: 'Uganda', capital: 'Kampala', continent: 'Africa', landmark: 'Bwindi Impenetrable Forest', trivia: 'Landlocked East African nation known as the Pearl of Africa, bordering Lake Victoria' },
  { name: 'Zambia', capital: 'Lusaka', continent: 'Africa', landmark: 'Victoria Falls', trivia: 'Landlocked nation in Southern Africa sharing Victoria Falls with Zimbabwe' },
  { name: 'Zimbabwe', capital: 'Harare', continent: 'Africa', landmark: 'Great Zimbabwe Ruins', trivia: 'Landlocked Southern African country between the Zambezi and Limpopo rivers' },
  { name: 'Botswana', capital: 'Gaborone', continent: 'Africa', landmark: 'Okavango Delta', trivia: 'Home to the Okavango Delta and much of the Kalahari Desert' },

  // Oceania
  { name: 'Australia', capital: 'Canberra', continent: 'Australia', landmark: 'Sydney Opera House', trivia: 'Sixth largest country by total area and the only country spanning an entire continent', shapeSvg: 'M136,24 L116,32 L102,26 L88,30 L74,38 L40,52 L32,70 L38,92 L46,104 L64,104 L80,98 L98,100 L108,104 L124,110 L144,104 L152,88 L148,50 Z M132,120 L144,120 L142,132 L132,130 Z' },
  { name: 'New Zealand', capital: 'Wellington', continent: 'Australia', landmark: 'Milford Sound', trivia: 'Island nation composed of North Island and South Island in the southwestern Pacific' },
  { name: 'Fiji', capital: 'Suva', continent: 'Australia', landmark: 'Coral Coast', trivia: 'Archipelago of more than 300 tropical islands in the South Pacific Ocean' },
  { name: 'Papua New Guinea', capital: 'Port Moresby', continent: 'Australia', landmark: 'Kokoda Track', trivia: 'Occupies the eastern half of the island of New Guinea in the southwestern Pacific' },
  { name: 'Samoa', capital: 'Apia', continent: 'Australia', landmark: 'To Sua Ocean Trench', trivia: 'Polynesian island nation in the central South Pacific Ocean' }
];

export const WORLD_LANDMARKS_AND_WONDERS = [
  // Mountains & Peaks
  {
    name: 'Mount Everest',
    type: 'mountain',
    continent: 'Asia',
    mountainRange: 'Himalayas',
    country: 'Nepal / China',
    fact: 'The highest mountain peak on Earth above sea level (8,848 meters / 29,031 feet).'
  },
  {
    name: 'K2',
    type: 'mountain',
    continent: 'Asia',
    mountainRange: 'Karakoram',
    country: 'Pakistan / China',
    fact: 'The second highest mountain on Earth (8,611 meters), renowned as Savage Mountain.'
  },
  {
    name: 'Mount Kilimanjaro',
    type: 'mountain',
    continent: 'Africa',
    country: 'Tanzania',
    fact: 'A free-standing dormant volcanic mountain in Tanzania and the highest peak in Africa (5,895 meters).'
  },
  {
    name: 'Aconcagua',
    type: 'mountain',
    continent: 'South America',
    mountainRange: 'Andes',
    country: 'Argentina',
    fact: 'The highest mountain peak in both the Western and Southern Hemispheres (6,961 meters).'
  },
  {
    name: 'Denali',
    type: 'mountain',
    continent: 'North America',
    mountainRange: 'Alaska Range',
    country: 'United States',
    fact: 'The highest mountain peak in North America (6,190 meters / 20,310 feet).'
  },
  {
    name: 'Mont Blanc',
    type: 'mountain',
    continent: 'Europe',
    mountainRange: 'Alps',
    country: 'France / Italy',
    fact: 'The highest mountain in the Alps and the highest peak in Western Europe (4,808 meters).'
  },
  {
    name: 'Matterhorn',
    type: 'mountain',
    continent: 'Europe',
    mountainRange: 'Alps',
    country: 'Switzerland / Italy',
    fact: 'Iconic pyramid-shaped Alpine peak on the border between Switzerland and Italy.'
  },
  {
    name: 'Mount Fuji',
    type: 'mountain',
    continent: 'Asia',
    country: 'Japan',
    fact: 'An active stratovolcano and the highest peak in Japan (3,776 meters), famous for its symmetrical snow cone.'
  },

  // Rivers
  {
    name: 'Nile River',
    type: 'river',
    continent: 'Africa',
    fact: 'Widely recognized as the longest river in the world, flowing north through Egypt into the Mediterranean Sea.'
  },
  {
    name: 'Amazon River',
    type: 'river',
    continent: 'South America',
    fact: 'The largest river in the world by water discharge volume, discharging more water than the next seven largest rivers combined.'
  },
  {
    name: 'Yangtze River',
    type: 'river',
    continent: 'Asia',
    country: 'China',
    fact: 'The longest river in Asia and the third longest in the world, flowing entirely within China.'
  },
  {
    name: 'Mississippi River',
    type: 'river',
    continent: 'North America',
    country: 'United States',
    fact: 'The chief river of the largest drainage system in North America, flowing into the Gulf of Mexico.'
  },
  {
    name: 'Danube River',
    type: 'river',
    continent: 'Europe',
    fact: 'Europe second longest river, flowing through or bordering 10 countries from Germany to the Black Sea.'
  },
  {
    name: 'Ganges River',
    type: 'river',
    continent: 'Asia',
    country: 'India / Bangladesh',
    fact: 'Trans-boundary river sacred to Hinduism flowing from the Himalayas into the Bay of Bengal.'
  },
  {
    name: 'Volga River',
    type: 'river',
    continent: 'Europe',
    country: 'Russia',
    fact: 'The longest river in Europe, discharging into the landlocked Caspian Sea.'
  },

  // Waterfalls
  {
    name: 'Angel Falls',
    type: 'waterfall',
    continent: 'South America',
    country: 'Venezuela',
    fact: 'The highest uninterrupted waterfall on Earth with a total plunge height of 979 meters (3,212 feet).'
  },
  {
    name: 'Victoria Falls',
    type: 'waterfall',
    continent: 'Africa',
    country: 'Zambia / Zimbabwe',
    fact: 'One of the world largest waterfalls, creating the greatest curtain of falling water on Earth on the Zambezi River.'
  },
  {
    name: 'Iguazu Falls',
    type: 'waterfall',
    continent: 'South America',
    country: 'Argentina / Brazil',
    fact: 'Massive chain of hundreds of cascading waterfalls on the border of Argentina and Brazil.'
  },
  {
    name: 'Niagara Falls',
    type: 'waterfall',
    continent: 'North America',
    country: 'United States / Canada',
    fact: 'Famed group of three waterfalls straddling the international border between New York and Ontario.'
  },

  // Deserts & Rainforests
  {
    name: 'Sahara Desert',
    type: 'desert',
    continent: 'Africa',
    fact: 'The largest hot desert in the world, spanning over 9 million square kilometers across North Africa.'
  },
  {
    name: 'Gobi Desert',
    type: 'desert',
    continent: 'Asia',
    country: 'Mongolia / China',
    fact: 'A large cold desert region in East Asia known for historical Silk Road routes and dinosaur fossils.'
  },
  {
    name: 'Atacama Desert',
    type: 'desert',
    continent: 'South America',
    country: 'Chile',
    fact: 'The driest non-polar desert on Earth, with some weather stations having never recorded any rainfall.'
  },
  {
    name: 'Kalahari Desert',
    type: 'desert',
    continent: 'Africa',
    country: 'Botswana / Namibia / South Africa',
    fact: 'A vast semi-arid sandy savanna in Southern Africa covering much of Botswana.'
  },
  {
    name: 'Amazon Rainforest',
    type: 'rainforest',
    continent: 'South America',
    fact: 'The largest tropical rainforest on Earth, often described as the lungs of our planet.'
  },

  // Lakes & Inland Seas
  {
    name: 'Lake Baikal',
    type: 'lake',
    continent: 'Asia',
    country: 'Russia',
    fact: 'The deepest and oldest freshwater lake on Earth, holding over 20% of the world unfrozen surface freshwater.'
  },
  {
    name: 'Caspian Sea',
    type: 'lake',
    continent: 'Europe / Asia',
    fact: 'The world largest inland body of water by surface area, classified as the world largest lake.'
  },
  {
    name: 'Lake Superior',
    type: 'lake',
    continent: 'North America',
    country: 'United States / Canada',
    fact: 'The largest freshwater lake in the world by surface area, shared by the US and Canada.'
  },
  {
    name: 'Lake Victoria',
    type: 'lake',
    continent: 'Africa',
    country: 'Tanzania / Uganda / Kenya',
    fact: 'Africa largest lake by surface area and the chief tropical reservoir source for the Nile River.'
  },
  {
    name: 'Dead Sea',
    type: 'lake',
    continent: 'Asia',
    country: 'Israel / Jordan',
    fact: 'A hypersaline landlocked lake whose shores represent the lowest exposed land elevation on Earth.'
  },
  {
    name: 'Lake Titicaca',
    type: 'lake',
    continent: 'South America',
    country: 'Peru / Bolivia',
    fact: 'The highest navigable body of water in the world, situated at 3,812 meters high in the Andes Mountains.'
  },

  // Canals, Reefs & Trenches
  {
    name: 'Mariana Trench',
    type: 'ocean_trench',
    continent: 'Pacific Ocean',
    fact: 'The deepest oceanic trench on Earth, containing the Challenger Deep at roughly 11,000 meters deep.'
  },
  {
    name: 'Great Barrier Reef',
    type: 'coral_reef',
    continent: 'Australia',
    country: 'Australia',
    fact: 'The world largest living structure and coral reef system, visible from outer space in the Coral Sea.'
  },
  {
    name: 'Panama Canal',
    type: 'canal',
    continent: 'North America',
    country: 'Panama',
    fact: 'An artificial 82-kilometer waterway in Central America that connects the Atlantic Ocean with the Pacific Ocean.'
  },
  {
    name: 'Suez Canal',
    type: 'canal',
    continent: 'Africa',
    country: 'Egypt',
    fact: 'An artificial sea-level waterway in Egypt connecting the Mediterranean Sea directly to the Red Sea.'
  }
];

export const TRICKY_CAPITALS = [
  { country: 'Australia', capital: 'Canberra', commonConfusion: 'Sydney', reason: "Sydney is Australia's largest city, but Canberra is the capital." },
  { country: 'Canada', capital: 'Ottawa', commonConfusion: 'Toronto', reason: 'Toronto and Montreal are larger, but Ottawa is the federal capital.' },
  { country: 'Brazil', capital: 'Brasília', commonConfusion: 'Rio de Janeiro', reason: 'Rio de Janeiro and São Paulo are famous, but Brasília was built specifically as the capital in 1960.' },
  { country: 'Switzerland', capital: 'Bern', commonConfusion: 'Zurich', reason: 'Zurich and Geneva are the largest cities, but Bern is the federal city and capital.' },
  { country: 'Turkey', capital: 'Ankara', commonConfusion: 'Istanbul', reason: 'Istanbul is the largest historic metropolis, but Ankara is the official capital.' },
  { country: 'United States', capital: 'Washington, D.C.', commonConfusion: 'New York City', reason: 'New York City is the most populous city, but Washington, D.C. is the federal capital district.' },
  { country: 'New Zealand', capital: 'Wellington', commonConfusion: 'Auckland', reason: 'Auckland has more residents, but Wellington is the capital.' },
  { country: 'Morocco', capital: 'Rabat', commonConfusion: 'Casablanca', reason: 'Casablanca is the commercial hub, but Rabat is the royal capital.' },
  { country: 'South Africa', capital: 'Pretoria', commonConfusion: 'Johannesburg', reason: 'Johannesburg is the largest city, but Pretoria is the executive administrative capital.' },
  { country: 'United Arab Emirates', capital: 'Abu Dhabi', commonConfusion: 'Dubai', reason: 'Dubai has the Burj Khalifa, but Abu Dhabi is the national federal capital.' },
  { country: 'Vietnam', capital: 'Hanoi', commonConfusion: 'Ho Chi Minh City', reason: 'Ho Chi Minh City is the largest metropolis, but Hanoi in the north is the capital.' },
  { country: 'Nigeria', capital: 'Abuja', commonConfusion: 'Lagos', reason: 'Lagos is the largest city in Africa, but Abuja was custom-built as the planned capital in 1991.' },
  { country: 'India', capital: 'New Delhi', commonConfusion: 'Mumbai', reason: 'Mumbai is the financial center, but New Delhi is the national capital.' },
  { country: 'Pakistan', capital: 'Islamabad', commonConfusion: 'Karachi', reason: 'Karachi is the largest coastal city, but Islamabad is the federal capital.' },
  { country: 'China', capital: 'Beijing', commonConfusion: 'Shanghai', reason: 'Shanghai is the most populous city, but Beijing is the national capital.' },
  { country: 'Germany', capital: 'Berlin', commonConfusion: 'Frankfurt', reason: 'Frankfurt is the financial hub, but Berlin is the federal capital.' },
  { country: 'Myanmar', capital: 'Naypyidaw', commonConfusion: 'Yangon', reason: 'Yangon (Rangoon) was the long-time capital, but Naypyidaw became capital in 2005.' },
  { country: 'Kazakhstan', capital: 'Astana', commonConfusion: 'Almaty', reason: 'Almaty is the cultural and largest city, but Astana is the capital.' },
  { country: 'Côte d’Ivoire', capital: 'Yamoussoukro', commonConfusion: 'Abidjan', reason: 'Abidjan is the economic center, but Yamoussoukro is the political capital.' },
  { country: 'Tanzania', capital: 'Dodoma', commonConfusion: 'Dar es Salaam', reason: 'Dar es Salaam is the major port and largest city, but Dodoma is the official capital.' },
  { country: 'Sri Lanka', capital: 'Sri Jayawardenepura Kotte', commonConfusion: 'Colombo', reason: 'Colombo is the commercial hub, while Sri Jayawardenepura Kotte is the legislative capital.' },
  { country: 'Bolivia', capital: 'Sucre', commonConfusion: 'La Paz', reason: 'La Paz hosts the government seat, but Sucre is the constitutional capital.' },
  { country: 'Ecuador', capital: 'Quito', commonConfusion: 'Guayaquil', reason: 'Guayaquil is the largest city and port, but Quito in the Andes is the capital.' },
  { country: 'Scotland', capital: 'Edinburgh', commonConfusion: 'Glasgow', reason: 'Glasgow is the most populous city, but Edinburgh is the historic capital.' },
  { country: 'Poland', capital: 'Warsaw', commonConfusion: 'Krakow', reason: 'Krakow was the ancient royal seat, but Warsaw has been the capital since 1596.' },
  { country: 'Saudi Arabia', capital: 'Riyadh', commonConfusion: 'Jeddah', reason: 'Jeddah is the main Red Sea gateway, but Riyadh in the center is the royal capital.' },
  { country: 'Egypt', capital: 'Cairo', commonConfusion: 'Alexandria', reason: 'Alexandria is the famous Mediterranean port, but Cairo is the capital.' },
  { country: 'Philippines', capital: 'Manila', commonConfusion: 'Quezon City', reason: 'Quezon City has more residents, but Manila is the designated capital.' },
  { country: 'Chile', capital: 'Santiago', commonConfusion: 'Valparaíso', reason: 'Valparaíso hosts the National Congress, but Santiago is the official capital.' },
  { country: 'Israel', capital: 'Jerusalem', commonConfusion: 'Tel Aviv', reason: 'Tel Aviv is the coastal economic hub, while Jerusalem is the seat of government.' },
  { country: 'Belize', capital: 'Belmopan', commonConfusion: 'Belize City', reason: 'Belize City was destroyed by a hurricane in 1961, prompting the inland capital Belmopan.' },
  { country: 'Benin', capital: 'Porto-Novo', commonConfusion: 'Cotonou', reason: 'Cotonou is the largest city and seat of government, but Porto-Novo is the constitutional capital.' },
  { country: 'Liechtenstein', capital: 'Vaduz', commonConfusion: 'Schaan', reason: 'Schaan is the most populous municipality, but Vaduz is the principality capital.' },
  { country: 'Malta', capital: 'Valletta', commonConfusion: 'Birkirkara', reason: 'Birkirkara is the largest city, but historic Valletta is the fortress capital.' },
  { country: 'Monaco', capital: 'Monaco', commonConfusion: 'Monte Carlo', reason: 'Monte Carlo is a famed quarter, while the whole city-state of Monaco is the capital.' },
  { country: 'San Marino', capital: 'San Marino', commonConfusion: 'Dogana', reason: 'Dogana is the most populous town, but the City of San Marino atop Mount Titano is the capital.' },
  { country: 'Trinidad and Tobago', capital: 'Port of Spain', commonConfusion: 'Chaguanas', reason: 'Chaguanas is the largest borough, but Port of Spain is the national capital.' },
  { country: 'Cameroon', capital: 'Yaoundé', commonConfusion: 'Douala', reason: 'Douala is the largest port city, but inland Yaoundé is the capital.' }
];

export const EXTREME_GEOGRAPHY = [
  {
    record: 'Highest mountain peak above sea level',
    answer: 'Mount Everest',
    details: 'Reaches 8,848 meters (29,031 feet) in the Himalayas on the border of Nepal and China.'
  },
  {
    record: 'Deepest point in the world oceans',
    answer: 'Challenger Deep (Mariana Trench)',
    details: 'Plunges to nearly 11,000 meters (36,000 feet) in the western Pacific Ocean.'
  },
  {
    record: 'Lowest exposed dry land on Earth',
    answer: 'Dead Sea Shore',
    details: 'Lies at approximately 430 meters (1,410 feet) below sea level between Israel and Jordan.'
  },
  {
    record: 'Highest uninterrupted waterfall on Earth',
    answer: 'Angel Falls',
    details: 'Cascades 979 meters (3,212 feet) from Auyán-tepui in Venezuela.'
  },
  {
    record: 'Driest non-polar desert on Earth',
    answer: 'Atacama Desert',
    details: 'Located in northern Chile, parts have recorded zero rainfall for decades.'
  },
  {
    record: 'Wettest place on Earth (highest average annual rainfall)',
    answer: 'Mawsynram (India)',
    details: 'Receives over 11,800 millimeters (467 inches) of monsoon rain annually in Meghalaya, India.'
  },
  {
    record: 'Largest freshwater lake by volume and deepest lake',
    answer: 'Lake Baikal',
    details: 'Located in Siberia, Russia, holding 20% of Earth unfrozen surface freshwater.'
  },
  {
    record: 'Largest lake by surface area (inland sea)',
    answer: 'Caspian Sea',
    details: 'Spans 371,000 square kilometers bordered by Russia, Kazakhstan, Turkmenistan, Iran, and Azerbaijan.'
  },
  {
    record: 'Largest island in the world (that is not a continent)',
    answer: 'Greenland',
    details: 'An autonomous territory of Denmark covering over 2.1 million square kilometers in the Arctic/Atlantic.'
  },
  {
    record: 'Largest landlocked country in the world by land area',
    answer: 'Kazakhstan',
    details: 'Spans 2.7 million square kilometers in Central Asia without direct access to the world oceans.'
  },
  {
    record: 'Sovereign country with the longest coastline',
    answer: 'Canada',
    details: 'Boasts over 202,080 kilometers (125,567 miles) of ocean coastline along three oceans.'
  },
  {
    record: 'Coldest temperature ever recorded on Earth (-89.2°C / -128.6°F)',
    answer: 'Vostok Station (Antarctica)',
    details: 'Recorded on the high Antarctic plateau by Soviet researchers in July 1983.'
  },
  {
    record: 'Hottest reliably recorded temperature on Earth (56.7°C / 134°F)',
    answer: 'Death Valley (Furnace Creek, USA)',
    details: 'Recorded in the California desert in July 1913.'
  },
  {
    record: 'Highest administrative capital city in the world',
    answer: 'La Paz (Bolivia)',
    details: 'Perched at approximately 3,640 meters (11,940 feet) above sea level in the Andes.'
  },
  {
    record: 'Northernmost sovereign national capital city in the world',
    answer: 'Reykjavik (Iceland)',
    details: 'Located at 64°08′ N latitude, just below the Arctic Circle.'
  },
  {
    record: 'Southernmost sovereign national capital city in the world',
    answer: 'Wellington (New Zealand)',
    details: 'Located at 41°17′ S latitude on the North Island of New Zealand.'
  },
  {
    record: 'Most remote permanently inhabited archipelago on Earth',
    answer: 'Tristan da Cunha',
    details: 'Located in the South Atlantic Ocean over 2,400 km from the nearest mainland (South Africa).'
  },
  {
    record: 'Largest river basin and highest river discharge volume',
    answer: 'Amazon River',
    details: 'Accounts for roughly one-fifth of the total global river discharge into oceans.'
  },
  {
    record: 'Largest coral reef ecosystem on Earth',
    answer: 'Great Barrier Reef',
    details: 'Extends for over 2,300 km off the northeast coast of Queensland, Australia.'
  },
  {
    record: 'Country spanning the greatest number of time zones (including overseas territories)',
    answer: 'France',
    details: 'Spans 12 different standard time zones across its global overseas departments and territories.'
  }
];

export const GEOPOLITICAL_ANOMALIES = [
  {
    type: 'enclave',
    name: 'Lesotho',
    enclosingCountry: 'South Africa',
    fact: 'Lesotho is an independent sovereign kingdom completely surrounded by South Africa.'
  },
  {
    type: 'enclave',
    name: 'San Marino',
    enclosingCountry: 'Italy',
    fact: 'San Marino is the world oldest continuous republic, completely surrounded by Italy.'
  },
  {
    type: 'enclave',
    name: 'Vatican City',
    enclosingCountry: 'Italy',
    fact: 'Vatican City is the smallest independent state on Earth, located entirely inside the city of Rome, Italy.'
  },
  {
    type: 'doubly_landlocked',
    name: 'Liechtenstein',
    neighborTypes: 'Surrounded entirely by landlocked nations (Switzerland and Austria)',
    fact: 'Liechtenstein is one of only two doubly-landlocked countries in the world.'
  },
  {
    type: 'doubly_landlocked',
    name: 'Uzbekistan',
    neighborTypes: 'Surrounded entirely by landlocked nations in Central Asia',
    fact: 'Uzbekistan is one of only two doubly-landlocked countries in the world.'
  },
  {
    type: 'transcontinental',
    name: 'Turkey',
    continents: ['Europe', 'Asia'],
    fact: 'Turkey spans Southeastern Europe (Thrace) and Western Asia (Anatolia) across the Turkish Straits.'
  },
  {
    type: 'transcontinental',
    name: 'Egypt',
    continents: ['Africa', 'Asia'],
    fact: 'Egypt is in North Africa, while its Sinai Peninsula lies in Western Asia across the Suez Canal.'
  },
  {
    type: 'transcontinental',
    name: 'Panama',
    continents: ['North America', 'South America'],
    fact: 'Panama bridges Central North America with South America.'
  },
  {
    type: 'transcontinental',
    name: 'Kazakhstan',
    continents: ['Asia', 'Europe'],
    fact: 'Most of Kazakhstan lies in Central Asia, but the area west of the Ural River lies in Eastern Europe.'
  }
];

export const GLOBAL_STRAITS = [
  {
    name: 'Strait of Gibraltar',
    connects: 'Atlantic Ocean and Mediterranean Sea',
    separates: 'Spain (Europe) and Morocco (Africa)',
    fact: 'Narrow 14-kilometer waterway guarding the entry into the Mediterranean Sea.'
  },
  {
    name: 'Strait of Malacca',
    connects: 'Indian Ocean and South China Sea (Pacific Ocean)',
    separates: 'Malay Peninsula (Malaysia/Singapore) and Sumatra (Indonesia)',
    fact: 'One of the most vital and heavily trafficked shipping lanes in the world.'
  },
  {
    name: 'Strait of Hormuz',
    connects: 'Persian Gulf and Gulf of Oman (Arabian Sea)',
    separates: 'Iran and Oman / UAE',
    fact: 'The world most strategic oil transit chokepoint through which roughly a fifth of global petroleum passes.'
  },
  {
    name: 'Bosphorus Strait',
    connects: 'Black Sea and Sea of Marmara',
    separates: 'European Istanbul and Asian Istanbul (Turkey)',
    fact: 'The world narrowest strait used for international navigation, dividing the city of Istanbul.'
  },
  {
    name: 'Dardanelles Strait',
    connects: 'Sea of Marmara and Aegean Sea (Mediterranean)',
    separates: 'Gallipoli Peninsula (Europe) and Asian Turkey',
    fact: 'Historic passage connecting the Black Sea region to the Mediterranean Sea.'
  },
  {
    name: 'Bering Strait',
    connects: 'Arctic Ocean (Chukchi Sea) and Pacific Ocean (Bering Sea)',
    separates: 'Alaska (United States) and Siberia (Russia)',
    fact: 'Narrow 82-kilometer strait separating North America from Asia.'
  },
  {
    name: 'English Channel (Strait of Dover)',
    connects: 'North Sea and Atlantic Ocean',
    separates: 'Great Britain (UK) and northern France',
    fact: 'Busy maritime passage crossed underneath by the Channel Tunnel (Eurotunnel).'
  },
  {
    name: 'Strait of Magellan',
    connects: 'Atlantic Ocean and Pacific Ocean',
    separates: 'Mainland South America and Tierra del Fuego',
    fact: 'Navigable sea route at the southern tip of Chile named after explorer Ferdinand Magellan.'
  },
  {
    name: 'Drake Passage',
    connects: 'Atlantic Ocean, Pacific Ocean, and Southern Ocean',
    separates: 'Cape Horn (South America) and the South Shetland Islands (Antarctica)',
    fact: 'Renowned as one of the roughest and most treacherous bodies of water on Earth.'
  },
  {
    name: 'Strait of Messina',
    connects: 'Tyrrhenian Sea and Ionian Sea',
    separates: 'Calabria (mainland Italy) and the island of Sicily',
    fact: 'Narrow Mediterranean strait famous in mythology for Scylla and Charybdis.'
  }
];

