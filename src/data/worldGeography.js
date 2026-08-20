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
    lowestPoint: 'Dead Sea'
  },
  {
    id: 'africa',
    name: 'Africa',
    areaRank: 2,
    popRank: 2,
    hemispheres: ['Northern', 'Southern', 'Eastern'],
    notableFeature: 'Home to the Sahara Desert and the Nile River',
    highestPoint: 'Mount Kilimanjaro',
    longestRiver: 'Nile River'
  },
  {
    id: 'north_america',
    name: 'North America',
    areaRank: 3,
    popRank: 4,
    hemispheres: ['Northern', 'Western'],
    notableFeature: 'Home to the United States, Canada, and Mexico',
    highestPoint: 'Denali'
  },
  {
    id: 'south_america',
    name: 'South America',
    areaRank: 4,
    popRank: 5,
    hemispheres: ['Southern', 'Western'],
    notableFeature: 'Home to the Amazon Rainforest and Andes Mountains',
    highestPoint: 'Aconcagua',
    largestRainforest: 'Amazon Rainforest'
  },
  {
    id: 'antarctica',
    name: 'Antarctica',
    areaRank: 5,
    popRank: 7,
    hemispheres: ['Southern'],
    notableFeature: 'Coldest, driest, and windiest continent, covered in ice',
    highestPoint: 'Vinson Massif'
  },
  {
    id: 'europe',
    name: 'Europe',
    areaRank: 6,
    popRank: 3,
    hemispheres: ['Northern', 'Eastern'],
    notableFeature: 'Second smallest continent, bordered by the Mediterranean Sea and Atlantic Ocean',
    highestPoint: 'Mount Elbrus'
  },
  {
    id: 'australia',
    name: 'Australia',
    areaRank: 7,
    popRank: 6,
    hemispheres: ['Southern', 'Eastern'],
    notableFeature: 'Smallest continent, completely surrounded by water (island continent)',
    highestPoint: 'Mount Kosciuszko',
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
    notableFeature: 'Largest and deepest ocean on Earth, covers over 30% of the surface'
  },
  {
    id: 'atlantic',
    name: 'Atlantic',
    fullName: 'Atlantic Ocean',
    sizeRank: 2,
    notableFeature: 'Second largest ocean, separates the Americas from Europe and Africa'
  },
  {
    id: 'indian',
    name: 'Indian',
    fullName: 'Indian Ocean',
    sizeRank: 3,
    notableFeature: 'Third largest ocean, warmest ocean, bounded by Asia, Africa, and Australia'
  },
  {
    id: 'southern',
    name: 'Southern',
    fullName: 'Southern Ocean',
    sizeRank: 4,
    notableFeature: 'Fourth largest ocean, completely encircles Antarctica'
  },
  {
    id: 'arctic',
    name: 'Arctic',
    fullName: 'Arctic Ocean',
    sizeRank: 5,
    notableFeature: 'Smallest and shallowest ocean, located around the North Pole, covered by sea ice'
  }
];

export const CARDINAL_DIRECTIONS = [
  { direction: 'North', opposite: 'South', mapPosition: 'top', hint: 'Points toward the top of a standard map.' },
  { direction: 'South', opposite: 'North', mapPosition: 'bottom', hint: 'Points toward the bottom of a standard map.' },
  { direction: 'East', opposite: 'West', mapPosition: 'right', hint: 'Points toward the right of a standard map, where the sun rises.' },
  { direction: 'West', opposite: 'East', mapPosition: 'left', hint: 'Points toward the left of a standard map, where the sun sets.' }
];

export const GEOGRAPHIC_FOUNDATIONS = [
  {
    concept: 'Equator',
    description: 'The imaginary line around the middle of Earth at 0° latitude dividing the Northern and Southern Hemispheres.',
    category: 'latitude'
  },
  {
    concept: 'Prime Meridian',
    description: 'The imaginary line at 0° longitude dividing the Eastern and Western Hemispheres.',
    category: 'longitude'
  },
  {
    concept: 'Northern Hemisphere',
    description: 'The half of Earth that lies north of the Equator.',
    category: 'hemisphere'
  },
  {
    concept: 'Southern Hemisphere',
    description: 'The half of Earth that lies south of the Equator.',
    category: 'hemisphere'
  },
  {
    concept: 'Eastern Hemisphere',
    description: 'The half of Earth that lies east of the Prime Meridian.',
    category: 'hemisphere'
  },
  {
    concept: 'Western Hemisphere',
    description: 'The half of Earth that lies west of the Prime Meridian.',
    category: 'hemisphere'
  }
];

export const US_STATES = [
  { name: 'Alabama', capital: 'Montgomery', region: 'South', nickname: 'Yellowhammer State' },
  { name: 'Alaska', capital: 'Juneau', region: 'West', nickname: 'The Last Frontier', trivia: 'Largest US state by land area', shapeSvg: 'M38,48 L135,28 L135,80 L148,92 L142,112 L125,92 L95,95 L68,82 L38,76 L22,90 L18,88 L28,75 Z M20,95 L12,100 L4,102 L2,104' },
  { name: 'Arizona', capital: 'Phoenix', region: 'West', nickname: 'Grand Canyon State', trivia: 'Home to the Grand Canyon' },
  { name: 'Arkansas', capital: 'Little Rock', region: 'South', nickname: 'Natural State' },
  { name: 'California', capital: 'Sacramento', region: 'West', nickname: 'Golden State', trivia: 'Most populous US state, borders Pacific Ocean', shapeSvg: 'M60,30 L102,30 L138,95 L145,130 L115,130 L95,115 L70,80 L52,50 Z' },
  { name: 'Colorado', capital: 'Denver', region: 'West', nickname: 'Centennial State', trivia: 'Known for the Rocky Mountains and Mile High City', shapeSvg: 'M55,35 L145,35 L145,105 L55,105 Z' },
  { name: 'Connecticut', capital: 'Hartford', region: 'Northeast', nickname: 'Constitution State' },
  { name: 'Delaware', capital: 'Dover', region: 'South', nickname: 'First State', trivia: 'First state to ratify the US Constitution' },
  { name: 'Florida', capital: 'Tallahassee', region: 'South', nickname: 'Sunshine State', trivia: 'Peninsula state known for Everglades and sunshine', shapeSvg: 'M35,38 L85,38 L120,40 L132,65 L140,105 L128,122 L118,120 L115,95 L105,65 L70,48 L35,48 Z' },
  { name: 'Georgia', capital: 'Atlanta', region: 'South', nickname: 'Peach State' },
  { name: 'Hawaii', capital: 'Honolulu', region: 'West', nickname: 'Aloha State', trivia: 'Only US state made entirely of islands in Pacific Ocean', shapeSvg: 'M32,40 A6,6 0 1,0 44,40 A6,6 0 1,0 32,40 M68,52 A7,7 0 1,0 82,52 A7,7 0 1,0 68,52 M98,62 A5,5 0 1,0 108,62 A5,5 0 1,0 98,62 M118,72 A8,8 0 1,0 134,72 A8,8 0 1,0 118,72 M145,95 A14,14 0 1,0 173,95 A14,14 0 1,0 145,95' },
  { name: 'Idaho', capital: 'Boise', region: 'West', nickname: 'Gem State' },
  { name: 'Illinois', capital: 'Springfield', region: 'Midwest', nickname: 'Prairie State' },
  { name: 'Indiana', capital: 'Indianapolis', region: 'Midwest', nickname: 'Hoosier State' },
  { name: 'Iowa', capital: 'Des Moines', region: 'Midwest', nickname: 'Hawkeye State' },
  { name: 'Kansas', capital: 'Topeka', region: 'Midwest', nickname: 'Sunflower State' },
  { name: 'Kentucky', capital: 'Frankfort', region: 'South', nickname: 'Bluegrass State' },
  { name: 'Louisiana', capital: 'Baton Rouge', region: 'South', nickname: 'Pelican State', trivia: 'Located at the mouth of the Mississippi River' },
  { name: 'Maine', capital: 'Augusta', region: 'Northeast', nickname: 'Pine Tree State', trivia: 'Northeasternmost state in the US' },
  { name: 'Maryland', capital: 'Annapolis', region: 'South', nickname: 'Old Line State' },
  { name: 'Massachusetts', capital: 'Boston', region: 'Northeast', nickname: 'Bay State' },
  { name: 'Michigan', capital: 'Lansing', region: 'Midwest', nickname: 'Great Lakes State', trivia: 'Surrounded by 4 of the 5 Great Lakes', shapeSvg: 'M45,35 L118,30 L115,48 L80,50 L50,45 Z M78,65 L115,62 L128,82 L120,118 L80,118 L75,90 Z' },
  { name: 'Minnesota', capital: 'St. Paul', region: 'Midwest', nickname: 'North Star State', trivia: 'Known as the Land of 10,000 Lakes and source of Mississippi River' },
  { name: 'Mississippi', capital: 'Jackson', region: 'South', nickname: 'Magnolia State' },
  { name: 'Missouri', capital: 'Jefferson City', region: 'Midwest', nickname: 'Show-Me State' },
  { name: 'Montana', capital: 'Helena', region: 'West', nickname: 'Treasure State' },
  { name: 'Nebraska', capital: 'Lincoln', region: 'Midwest', nickname: 'Cornhusker State' },
  { name: 'Nevada', capital: 'Carson City', region: 'West', nickname: 'Silver State' },
  { name: 'New Hampshire', capital: 'Concord', region: 'Northeast', nickname: 'Granite State' },
  { name: 'New Jersey', capital: 'Trenton', region: 'Northeast', nickname: 'Garden State' },
  { name: 'New Mexico', capital: 'Santa Fe', region: 'West', nickname: 'Land of Enchantment', trivia: 'Santa Fe is the oldest state capital in the US' },
  { name: 'New York', capital: 'Albany', region: 'Northeast', nickname: 'Empire State', shapeSvg: 'M35,62 L85,42 L132,32 L148,32 L148,105 L135,105 L132,82 L35,82 Z M136,108 L170,112 L170,118 L136,114 Z' },
  { name: 'North Carolina', capital: 'Raleigh', region: 'South', nickname: 'Tar Heel State' },
  { name: 'North Dakota', capital: 'Bismarck', region: 'Midwest', nickname: 'Peace Garden State' },
  { name: 'Ohio', capital: 'Columbus', region: 'Midwest', nickname: 'Buckeye State' },
  { name: 'Oklahoma', capital: 'Oklahoma City', region: 'South', nickname: 'Sooner State', trivia: 'Known for its distinct western panhandle' },
  { name: 'Oregon', capital: 'Salem', region: 'West', nickname: 'Beaver State', trivia: 'Pacific Northwest state bordering the Pacific Ocean' },
  { name: 'Pennsylvania', capital: 'Harrisburg', region: 'Northeast', nickname: 'Keystone State' },
  { name: 'Rhode Island', capital: 'Providence', region: 'Northeast', nickname: 'Ocean State', trivia: 'Smallest US state by land area' },
  { name: 'South Carolina', capital: 'Columbia', region: 'South', nickname: 'Palmetto State' },
  { name: 'South Dakota', capital: 'Pierre', region: 'Midwest', nickname: 'Mount Rushmore State', trivia: 'Home to Mount Rushmore' },
  { name: 'Tennessee', capital: 'Nashville', region: 'South', nickname: 'Volunteer State' },
  { name: 'Texas', capital: 'Austin', region: 'South', nickname: 'Lone Star State', trivia: 'Second largest US state by both area and population', shapeSvg: 'M55,25 L95,25 L95,38 L135,38 L148,80 L140,110 L115,132 L95,115 L65,80 L45,80 L45,55 L55,55 Z' },
  { name: 'Utah', capital: 'Salt Lake City', region: 'West', nickname: 'Beehive State', trivia: 'Home to the Great Salt Lake' },
  { name: 'Vermont', capital: 'Montpelier', region: 'Northeast', nickname: 'Green Mountain State' },
  { name: 'Virginia', capital: 'Richmond', region: 'South', nickname: 'Old Dominion' },
  { name: 'Washington', capital: 'Olympia', region: 'West', nickname: 'Evergreen State', trivia: 'Home to Mount Rainier and Seattle' },
  { name: 'West Virginia', capital: 'Charleston', region: 'South', nickname: 'Mountain State' },
  { name: 'Wisconsin', capital: 'Madison', region: 'Midwest', nickname: 'Badger State' },
  { name: 'Wyoming', capital: 'Cheyenne', region: 'West', nickname: 'Equality State', trivia: 'Least populous US state, home to Yellowstone National Park', shapeSvg: 'M55,35 L145,35 L145,95 L55,95 Z' }
];

export const COUNTRIES = [
  // North America
  { name: 'United States', capital: 'Washington, D.C.', continent: 'North America', landmark: 'Statue of Liberty' },
  { name: 'Canada', capital: 'Ottawa', continent: 'North America', landmark: 'Niagara Falls', trivia: 'Second largest country in the world by total area' },
  { name: 'Mexico', capital: 'Mexico City', continent: 'North America', landmark: 'Chichen Itza', shapeSvg: 'M24,32 L40,32 L48,54 L54,76 L48,92 L42,98 L38,96 L42,78 L34,56 L22,38 Z M44,32 L80,26 L98,38 L112,34 L132,44 L126,60 L134,78 L146,84 L155,80 L158,64 L172,58 L178,64 L176,78 L170,84 L156,88 L148,102 L140,106 L124,98 L105,92 L86,78 L68,62 L56,44 Z' },
  { name: 'Cuba', capital: 'Havana', continent: 'North America', landmark: 'Old Havana' },
  { name: 'Jamaica', capital: 'Kingston', continent: 'North America', landmark: 'Blue Mountains' },
  { name: 'Costa Rica', capital: 'San José', continent: 'North America', landmark: 'Arenal Volcano' },
  { name: 'Panama', capital: 'Panama City', continent: 'North America', landmark: 'Panama Canal', trivia: 'Connects the Atlantic and Pacific Oceans' },

  // South America
  { name: 'Brazil', capital: 'Brasília', continent: 'South America', landmark: 'Christ the Redeemer', trivia: 'Largest country in South America, home to Amazon Rainforest', shapeSvg: 'M122,22 L108,22 L95,24 L78,22 L64,28 L52,38 L45,52 L36,62 L44,74 L58,76 L68,92 L78,98 L84,108 L92,114 L88,122 L96,128 L105,128 L115,120 L126,106 L138,94 L148,82 L155,68 L162,54 L148,38 L136,28 Z' },
  { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', landmark: 'Iguazu Falls', trivia: 'Home to the Pampas and Patagonia' },
  { name: 'Chile', capital: 'Santiago', continent: 'South America', landmark: 'Easter Island', trivia: 'Longest north-to-south narrow country in the world', shapeSvg: 'M82,14 L90,14 L96,24 L95,42 L94,58 L92,80 L94,102 L98,118 L104,132 L96,136 L88,134 L82,124 L86,114 L80,100 L82,82 L80,60 L78,38 L76,22 Z M92,136 L98,138 L94,140 Z' },
  { name: 'Peru', capital: 'Lima', continent: 'South America', landmark: 'Machu Picchu', trivia: 'Home to the ancient Incan citadel of Machu Picchu' },
  { name: 'Colombia', capital: 'Bogotá', continent: 'South America', landmark: 'Coffee Cultural Landscape' },
  { name: 'Ecuador', capital: 'Quito', continent: 'South America', landmark: 'Galapagos Islands', trivia: 'Named after the Equator which passes directly through it' },
  { name: 'Venezuela', capital: 'Caracas', continent: 'South America', landmark: 'Angel Falls', trivia: 'Home to Angel Falls, the world highest uninterrupted waterfall' },

  // Europe
  { name: 'United Kingdom', capital: 'London', continent: 'Europe', landmark: 'Big Ben', trivia: 'Island nation comprising England, Scotland, Wales, and Northern Ireland', shapeSvg: 'M102,14 L94,16 L88,28 L98,26 L108,24 L114,30 L104,38 L112,48 L118,62 L132,70 L136,82 L126,92 L132,98 L120,102 L108,100 L96,104 L82,108 L84,102 L94,98 L98,92 L86,88 L82,78 L86,70 L94,68 L96,56 L90,44 L92,32 Z M62,48 L76,46 L78,58 L68,62 L60,56 Z M106,8 L112,8 L110,12 Z M82,20 L86,18 L84,26 Z' },
  { name: 'France', capital: 'Paris', continent: 'Europe', landmark: 'Eiffel Tower', trivia: 'Hexagonal shaped country in Western Europe', shapeSvg: 'M105,22 L94,28 L82,34 L84,42 L54,44 L46,50 L52,58 L66,58 L74,70 L78,92 L76,108 L92,108 L108,110 L122,104 L134,102 L140,96 L138,84 L132,74 L134,66 L128,58 L132,48 L126,38 L118,32 Z M154,104 L160,102 L162,116 L156,118 Z' },
  { name: 'Germany', capital: 'Berlin', continent: 'Europe', landmark: 'Brandenburg Gate' },
  { name: 'Italy', capital: 'Rome', continent: 'Europe', landmark: 'Colosseum', trivia: 'Famous boot-shaped peninsula jutting into Mediterranean Sea', shapeSvg: 'M68,46 L64,32 L74,24 L88,22 L102,22 L114,20 L126,22 L132,28 L128,34 L122,42 L134,60 L148,76 L156,78 L152,84 L166,92 L168,104 L158,106 L148,98 L142,104 L144,114 L136,122 L132,116 L134,106 L126,98 L118,86 L104,72 L92,58 L78,48 Z M112,120 L130,118 L132,128 L118,132 L108,126 Z M56,78 L66,78 L64,102 L54,102 Z' },
  { name: 'Spain', capital: 'Madrid', continent: 'Europe', landmark: 'Sagrada Familia', trivia: 'Occupies most of the Iberian Peninsula' },
  { name: 'Portugal', capital: 'Lisbon', continent: 'Europe', landmark: 'Belem Tower', trivia: 'Westernmost sovereign state in mainland Europe' },
  { name: 'Ireland', capital: 'Dublin', continent: 'Europe', landmark: 'Cliffs of Moher', trivia: 'Known as the Emerald Isle' },
  { name: 'Netherlands', capital: 'Amsterdam', continent: 'Europe', landmark: 'Windmills of Kinderdijk', trivia: 'Famous for canals, tulips, and low-lying land below sea level' },
  { name: 'Belgium', capital: 'Brussels', continent: 'Europe', landmark: 'Grand Place' },
  { name: 'Switzerland', capital: 'Bern', continent: 'Europe', landmark: 'Matterhorn', trivia: 'Alpine nation known for neutrality and the Swiss Alps' },
  { name: 'Austria', capital: 'Vienna', continent: 'Europe', landmark: 'Schönbrunn Palace' },
  { name: 'Greece', capital: 'Athens', continent: 'Europe', landmark: 'Parthenon (Acropolis)', trivia: 'Cradle of Western democracy and thousands of Aegean islands' },
  { name: 'Sweden', capital: 'Stockholm', continent: 'Europe', landmark: 'Vasa Museum', trivia: 'Scandinavian country between Norway and Baltic Sea' },
  { name: 'Norway', capital: 'Oslo', continent: 'Europe', landmark: 'Geirangerfjord', trivia: 'Famous for its deep coastal fjords and Midnight Sun' },
  { name: 'Finland', capital: 'Helsinki', continent: 'Europe', landmark: 'Suomenlinna Fortress', trivia: 'Known as the Land of a Thousand Lakes' },
  { name: 'Denmark', capital: 'Copenhagen', continent: 'Europe', landmark: 'Little Mermaid Statue' },
  { name: 'Poland', capital: 'Warsaw', continent: 'Europe', landmark: 'Wawel Castle' },
  { name: 'Iceland', capital: 'Reykjavik', continent: 'Europe', landmark: 'Blue Lagoon', trivia: 'Volcanic island nation known for hot geysers and glaciers' },
  { name: 'Turkey', capital: 'Ankara', continent: 'Europe', landmark: 'Hagia Sophia', trivia: 'Transcontinental nation bridging Europe and Asia via the Bosphorus Strait' },
  { name: 'Ukraine', capital: 'Kyiv', continent: 'Europe', landmark: 'Saint Sophia Cathedral' },

  // Asia
  { name: 'Japan', capital: 'Tokyo', continent: 'Asia', landmark: 'Mount Fuji', trivia: 'East Asian archipelago of over 6,800 islands', shapeSvg: 'M152,14 L172,20 L168,36 L148,38 L142,26 Z M142,40 L156,52 L152,68 L142,82 L132,90 L118,98 L98,104 L84,108 L96,96 L115,84 L132,64 L138,48 Z M96,102 L112,100 L108,112 L94,110 Z M74,104 L88,104 L84,122 L70,122 L68,112 Z M45,128 L52,130 L48,134 Z' },
  { name: 'China', capital: 'Beijing', continent: 'Asia', landmark: 'Great Wall of China', trivia: 'Home to the Great Wall and Yangtze River' },
  { name: 'India', capital: 'New Delhi', continent: 'Asia', landmark: 'Taj Mahal', trivia: 'South Asian peninsula bounded by Indian Ocean', shapeSvg: 'M68,16 L82,14 L92,22 L102,28 L126,30 L132,28 L138,30 L148,28 L165,26 L168,38 L158,48 L148,46 L142,42 L138,54 L132,68 L122,88 L108,112 L96,126 L88,114 L78,94 L70,74 L54,72 L48,62 L58,56 L52,48 L62,38 Z' },
  { name: 'South Korea', capital: 'Seoul', continent: 'Asia', landmark: 'Gyeongbokgung Palace' },
  { name: 'Indonesia', capital: 'Jakarta', continent: 'Asia', landmark: 'Borobudur Temple', trivia: 'World largest archipelago country with over 17,000 islands' },
  { name: 'Saudi Arabia', capital: 'Riyadh', continent: 'Asia', landmark: 'Al-Masjid an-Nabawi', trivia: 'Occupies most of the Arabian Peninsula' },
  { name: 'Thailand', capital: 'Bangkok', continent: 'Asia', landmark: 'Grand Palace' },
  { name: 'Vietnam', capital: 'Hanoi', continent: 'Asia', landmark: 'Ha Long Bay' },
  { name: 'Philippines', capital: 'Manila', continent: 'Asia', landmark: 'Chocolate Hills', trivia: 'Archipelago of over 7,000 islands in Southeast Asia' },
  { name: 'Singapore', capital: 'Singapore', continent: 'Asia', landmark: 'Marina Bay Sands', trivia: 'Island city-state located at the southern tip of Malay Peninsula' },
  { name: 'Pakistan', capital: 'Islamabad', continent: 'Asia', landmark: 'Badshahi Mosque' },
  { name: 'Bangladesh', capital: 'Dhaka', continent: 'Asia', landmark: 'Sundarbans Mangrove Forest' },
  { name: 'United Arab Emirates', capital: 'Abu Dhabi', continent: 'Asia', landmark: 'Burj Khalifa (Dubai)', trivia: 'Home to Burj Khalifa, the tallest building on Earth' },
  { name: 'Israel', capital: 'Jerusalem', continent: 'Asia', landmark: 'Western Wall' },

  // Africa
  { name: 'Egypt', capital: 'Cairo', continent: 'Africa', landmark: 'Pyramids of Giza', trivia: 'Northeast African nation home to the Nile River and Great Sphinx', shapeSvg: 'M56,30 L88,32 L98,24 L112,24 L122,30 L138,24 L142,44 L138,56 L130,48 L124,38 L132,60 L144,82 L152,104 L156,120 L56,120 Z' },
  { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', landmark: 'Table Mountain (Cape Town)', trivia: 'Southernmost country in Africa' },
  { name: 'Nigeria', capital: 'Abuja', continent: 'Africa', landmark: 'Zuma Rock', trivia: 'Most populous country in Africa' },
  { name: 'Kenya', capital: 'Nairobi', continent: 'Africa', landmark: 'Maasai Mara', trivia: 'East African nation famous for scenic savannah safaris' },
  { name: 'Morocco', capital: 'Rabat', continent: 'Africa', landmark: 'Hassan II Mosque', trivia: 'Northwest African country bordering the Atlantic Ocean and Mediterranean Sea' },
  { name: 'Ghana', capital: 'Accra', continent: 'Africa', landmark: 'Cape Coast Castle', trivia: 'West African nation on the Gulf of Guinea' },
  { name: 'Ethiopia', capital: 'Addis Ababa', continent: 'Africa', landmark: 'Rock-Hewn Churches of Lalibela', trivia: 'Horn of Africa country that was never colonized' },
  { name: 'Tanzania', capital: 'Dodoma', continent: 'Africa', landmark: 'Mount Kilimanjaro', trivia: 'Home to Mount Kilimanjaro, the highest peak in Africa' },
  { name: 'Madagascar', capital: 'Antananarivo', continent: 'Africa', landmark: 'Avenue of the Baobabs', trivia: 'Fourth largest island in the world, located off southeast coast of Africa', shapeSvg: 'M114,18 L124,28 L132,38 L126,44 L122,64 L114,92 L104,116 L94,124 L86,122 L88,102 L92,80 L98,54 L106,34 Z' },

  // Oceania
  { name: 'Australia', capital: 'Canberra', continent: 'Australia', landmark: 'Sydney Opera House', trivia: 'Sixth largest country by total area and the only country spanning an entire continent', shapeSvg: 'M136,26 L126,38 L114,34 L104,28 L92,30 L78,38 L62,44 L42,54 L34,70 L40,90 L48,104 L62,104 L78,98 L96,98 L110,104 L114,102 L122,108 L134,112 L144,108 L152,94 L154,74 L148,54 L138,38 Z M134,120 L144,120 L142,132 L132,130 Z' },
  { name: 'New Zealand', capital: 'Wellington', continent: 'Australia', landmark: 'Milford Sound', trivia: 'Island nation composed of North Island and South Island in the southwestern Pacific' },
  { name: 'Fiji', capital: 'Suva', continent: 'Australia', landmark: 'Coral Coast' }
];

export const WORLD_LANDMARKS_AND_WONDERS = [
  {
    name: 'Mount Everest',
    type: 'mountain',
    continent: 'Asia',
    mountainRange: 'Himalayas',
    fact: 'The highest mountain peak on Earth above sea level (8,848 meters / 29,031 feet).'
  },
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
    fact: 'The largest river in the world by water discharge volume, flowing through the Amazon Rainforest.'
  },
  {
    name: 'Amazon Rainforest',
    type: 'rainforest',
    continent: 'South America',
    fact: 'The largest tropical rainforest on Earth, spanning Brazil, Peru, Colombia, and neighboring nations.'
  },
  {
    name: 'Sahara Desert',
    type: 'desert',
    continent: 'Africa',
    fact: 'The largest hot desert in the world, covering much of North Africa.'
  },
  {
    name: 'Mariana Trench',
    type: 'ocean_trench',
    continent: 'Pacific Ocean',
    fact: 'The deepest oceanic trench on Earth, containing the Challenger Deep at roughly 11,000 meters deep.'
  },
  {
    name: 'Angel Falls',
    type: 'waterfall',
    continent: 'South America',
    country: 'Venezuela',
    fact: 'The highest uninterrupted waterfall in the world with a height of 979 meters (3,212 feet).'
  },
  {
    name: 'Great Barrier Reef',
    type: 'coral_reef',
    continent: 'Australia',
    fact: 'The world largest coral reef system, located in the Coral Sea off the coast of Queensland, Australia.'
  },
  {
    name: 'Panama Canal',
    type: 'canal',
    continent: 'North America',
    country: 'Panama',
    fact: 'An artificial waterway that connects the Atlantic Ocean with the Pacific Ocean.'
  },
  {
    name: 'Suez Canal',
    type: 'canal',
    continent: 'Africa',
    country: 'Egypt',
    fact: 'An artificial waterway in Egypt that connects the Mediterranean Sea to the Red Sea.'
  },
  {
    name: 'Strait of Gibraltar',
    type: 'strait',
    continent: 'Europe / Africa',
    fact: 'A narrow strait connecting the Atlantic Ocean to the Mediterranean Sea and separating Spain from Morocco.'
  },
  {
    name: 'Mount Kilimanjaro',
    type: 'mountain',
    continent: 'Africa',
    country: 'Tanzania',
    fact: 'A dormant volcano in Tanzania and the highest mountain in Africa (5,895 meters).'
  },
  {
    name: 'Lake Baikal',
    type: 'lake',
    continent: 'Asia',
    country: 'Russia',
    fact: 'The deepest and oldest freshwater lake in the world, containing roughly 20% of Earth unfrozen surface freshwater.'
  }
];

export const TRICKY_CAPITALS = [
  { country: 'Australia', capital: 'Canberra', commonConfusion: 'Sydney', reason: 'Sydney is Australia largest city, but Canberra is the capital.' },
  { country: 'Canada', capital: 'Ottawa', commonConfusion: 'Toronto', reason: 'Toronto and Montreal are larger, but Ottawa is the capital.' },
  { country: 'Brazil', capital: 'Brasília', commonConfusion: 'Rio de Janeiro', reason: 'Rio de Janeiro and São Paulo are famous, but Brasília was built as the capital.' },
  { country: 'Switzerland', capital: 'Bern', commonConfusion: 'Zurich', reason: 'Zurich and Geneva are the biggest cities, but Bern is the federal capital.' },
  { country: 'Turkey', capital: 'Ankara', commonConfusion: 'Istanbul', reason: 'Istanbul is the most famous historic city, but Ankara is the capital.' },
  { country: 'United States', capital: 'Washington, D.C.', commonConfusion: 'New York City', reason: 'New York City is the most populous city, but Washington, D.C. is the capital.' },
  { country: 'New Zealand', capital: 'Wellington', commonConfusion: 'Auckland', reason: 'Auckland has more residents, but Wellington is the capital.' },
  { country: 'Morocco', capital: 'Rabat', commonConfusion: 'Casablanca', reason: 'Casablanca is the commercial hub, but Rabat is the royal capital.' },
  { country: 'South Africa', capital: 'Pretoria', commonConfusion: 'Johannesburg', reason: 'Johannesburg is the largest city, but Pretoria is the executive capital.' },
  { country: 'United Arab Emirates', capital: 'Abu Dhabi', commonConfusion: 'Dubai', reason: 'Dubai has the Burj Khalifa, but Abu Dhabi is the national capital.' },
  { country: 'Vietnam', capital: 'Hanoi', commonConfusion: 'Ho Chi Minh City', reason: 'Ho Chi Minh City is the biggest city, but Hanoi is the capital.' },
  { country: 'Nigeria', capital: 'Abuja', commonConfusion: 'Lagos', reason: 'Lagos is the largest metropolis, but Abuja was established as the capital in 1991.' },
  { country: 'India', capital: 'New Delhi', commonConfusion: 'Mumbai', reason: 'Mumbai is the financial capital, but New Delhi is the national capital.' },
  { country: 'Pakistan', capital: 'Islamabad', commonConfusion: 'Karachi', reason: 'Karachi is the largest city, but Islamabad is the federal capital.' }
];
