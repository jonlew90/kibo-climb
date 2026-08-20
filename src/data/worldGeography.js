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
  { name: 'Alaska', capital: 'Juneau', region: 'West', nickname: 'The Last Frontier', trivia: 'Largest US state by land area', shapeSvg: 'M15,55 L35,45 L55,48 L80,35 L88,48 L72,65 L50,70 L30,78 L18,72 Z' },
  { name: 'Arizona', capital: 'Phoenix', region: 'West', nickname: 'Grand Canyon State', trivia: 'Home to the Grand Canyon' },
  { name: 'Arkansas', capital: 'Little Rock', region: 'South', nickname: 'Natural State' },
  { name: 'California', capital: 'Sacramento', region: 'West', nickname: 'Golden State', trivia: 'Most populous US state, borders Pacific Ocean', shapeSvg: 'M20,20 L40,10 L50,30 L70,80 L60,90 L40,80 L20,40 Z' },
  { name: 'Colorado', capital: 'Denver', region: 'West', nickname: 'Centennial State', trivia: 'Known for the Rocky Mountains and Mile High City', shapeSvg: 'M15,25 L85,25 L85,75 L15,75 Z' },
  { name: 'Connecticut', capital: 'Hartford', region: 'Northeast', nickname: 'Constitution State' },
  { name: 'Delaware', capital: 'Dover', region: 'South', nickname: 'First State', trivia: 'First state to ratify the US Constitution' },
  { name: 'Florida', capital: 'Tallahassee', region: 'South', nickname: 'Sunshine State', trivia: 'Peninsula state known for Everglades and sunshine', shapeSvg: 'M15,20 L55,20 L60,40 L90,80 L80,90 L50,55 L15,30 Z' },
  { name: 'Georgia', capital: 'Atlanta', region: 'South', nickname: 'Peach State' },
  { name: 'Hawaii', capital: 'Honolulu', region: 'West', nickname: 'Aloha State', trivia: 'Only US state made entirely of islands in Pacific Ocean', shapeSvg: 'M15,70 A6,6 0 1,0 27,70 M35,55 A8,8 0 1,0 51,55 M60,40 A7,7 0 1,0 74,40 M78,28 A5,5 0 1,0 88,28' },
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
  { name: 'Michigan', capital: 'Lansing', region: 'Midwest', nickname: 'Great Lakes State', trivia: 'Surrounded by 4 of the 5 Great Lakes', shapeSvg: 'M25,20 L60,18 L65,35 L45,40 L35,30 Z M50,45 L75,45 L80,75 L60,85 L50,65 Z' },
  { name: 'Minnesota', capital: 'St. Paul', region: 'Midwest', nickname: 'North Star State', trivia: 'Known as the Land of 10,000 Lakes and source of Mississippi River' },
  { name: 'Mississippi', capital: 'Jackson', region: 'South', nickname: 'Magnolia State' },
  { name: 'Missouri', capital: 'Jefferson City', region: 'Midwest', nickname: 'Show-Me State' },
  { name: 'Montana', capital: 'Helena', region: 'West', nickname: 'Treasure State' },
  { name: 'Nebraska', capital: 'Lincoln', region: 'Midwest', nickname: 'Cornhusker State' },
  { name: 'Nevada', capital: 'Carson City', region: 'West', nickname: 'Silver State' },
  { name: 'New Hampshire', capital: 'Concord', region: 'Northeast', nickname: 'Granite State' },
  { name: 'New Jersey', capital: 'Trenton', region: 'Northeast', nickname: 'Garden State' },
  { name: 'New Mexico', capital: 'Santa Fe', region: 'West', nickname: 'Land of Enchantment', trivia: 'Santa Fe is the oldest state capital in the US' },
  { name: 'New York', capital: 'Albany', region: 'Northeast', nickname: 'Empire State', shapeSvg: 'M20,40 L65,30 L85,45 L85,85 L65,85 L45,60 L20,45 Z' },
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
  { name: 'Texas', capital: 'Austin', region: 'South', nickname: 'Lone Star State', trivia: 'Second largest US state by both area and population', shapeSvg: 'M15,20 L55,20 L55,38 L88,42 L80,90 L40,82 L22,62 L15,50 Z' },
  { name: 'Utah', capital: 'Salt Lake City', region: 'West', nickname: 'Beehive State', trivia: 'Home to the Great Salt Lake' },
  { name: 'Vermont', capital: 'Montpelier', region: 'Northeast', nickname: 'Green Mountain State' },
  { name: 'Virginia', capital: 'Richmond', region: 'South', nickname: 'Old Dominion' },
  { name: 'Washington', capital: 'Olympia', region: 'West', nickname: 'Evergreen State', trivia: 'Home to Mount Rainier and Seattle' },
  { name: 'West Virginia', capital: 'Charleston', region: 'South', nickname: 'Mountain State' },
  { name: 'Wisconsin', capital: 'Madison', region: 'Midwest', nickname: 'Badger State' },
  { name: 'Wyoming', capital: 'Cheyenne', region: 'West', nickname: 'Equality State', trivia: 'Least populous US state, home to Yellowstone National Park', shapeSvg: 'M15,25 L85,25 L85,75 L15,75 Z' }
];

export const COUNTRIES = [
  // North America
  { name: 'United States', capital: 'Washington, D.C.', continent: 'North America', landmark: 'Statue of Liberty' },
  { name: 'Canada', capital: 'Ottawa', continent: 'North America', landmark: 'Niagara Falls', trivia: 'Second largest country in the world by total area' },
  { name: 'Mexico', capital: 'Mexico City', continent: 'North America', landmark: 'Chichen Itza', shapeSvg: 'M15,25 L50,30 L75,55 L85,75 L65,70 L40,55 L20,40 Z' },
  { name: 'Cuba', capital: 'Havana', continent: 'North America', landmark: 'Old Havana' },
  { name: 'Jamaica', capital: 'Kingston', continent: 'North America', landmark: 'Blue Mountains' },
  { name: 'Costa Rica', capital: 'San José', continent: 'North America', landmark: 'Arenal Volcano' },
  { name: 'Panama', capital: 'Panama City', continent: 'North America', landmark: 'Panama Canal', trivia: 'Connects the Atlantic and Pacific Oceans' },

  // South America
  { name: 'Brazil', capital: 'Brasília', continent: 'South America', landmark: 'Christ the Redeemer', trivia: 'Largest country in South America, home to Amazon Rainforest', shapeSvg: 'M25,20 L65,15 L85,45 L75,80 L50,85 L35,60 L20,40 Z' },
  { name: 'Argentina', capital: 'Buenos Aires', continent: 'South America', landmark: 'Iguazu Falls', trivia: 'Home to the Pampas and Patagonia' },
  { name: 'Chile', capital: 'Santiago', continent: 'South America', landmark: 'Easter Island', trivia: 'Longest north-to-south narrow country in the world', shapeSvg: 'M55,15 L62,15 L48,50 L42,85 L35,85 L42,50 Z' },
  { name: 'Peru', capital: 'Lima', continent: 'South America', landmark: 'Machu Picchu', trivia: 'Home to the ancient Incan citadel of Machu Picchu' },
  { name: 'Colombia', capital: 'Bogotá', continent: 'South America', landmark: 'Coffee Cultural Landscape' },
  { name: 'Ecuador', capital: 'Quito', continent: 'South America', landmark: 'Galapagos Islands', trivia: 'Named after the Equator which passes directly through it' },
  { name: 'Venezuela', capital: 'Caracas', continent: 'South America', landmark: 'Angel Falls', trivia: 'Home to Angel Falls, the world highest uninterrupted waterfall' },

  // Europe
  { name: 'United Kingdom', capital: 'London', continent: 'Europe', landmark: 'Big Ben', trivia: 'Island nation comprising England, Scotland, Wales, and Northern Ireland', shapeSvg: 'M40,15 L55,18 L48,45 L65,65 L50,80 L35,65 L30,45 Z M20,45 L32,45 L28,60 L18,55 Z' },
  { name: 'France', capital: 'Paris', continent: 'Europe', landmark: 'Eiffel Tower', trivia: 'Hexagonal shaped country in Western Europe', shapeSvg: 'M35,20 L65,22 L80,45 L65,78 L35,78 L20,45 Z' },
  { name: 'Germany', capital: 'Berlin', continent: 'Europe', landmark: 'Brandenburg Gate' },
  { name: 'Italy', capital: 'Rome', continent: 'Europe', landmark: 'Colosseum', trivia: 'Famous boot-shaped peninsula jutting into Mediterranean Sea', shapeSvg: 'M30,20 L50,10 L60,40 L80,80 L60,90 L40,70 L30,50 Z' },
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
  { name: 'Japan', capital: 'Tokyo', continent: 'Asia', landmark: 'Mount Fuji', trivia: 'East Asian archipelago of over 6,800 islands', shapeSvg: 'M70,10 L80,30 L60,60 L40,80 L20,90 L30,70 L50,40 Z' },
  { name: 'China', capital: 'Beijing', continent: 'Asia', landmark: 'Great Wall of China', trivia: 'Home to the Great Wall and Yangtze River' },
  { name: 'India', capital: 'New Delhi', continent: 'Asia', landmark: 'Taj Mahal', trivia: 'South Asian peninsula bounded by Indian Ocean', shapeSvg: 'M35,15 L65,15 L75,40 L50,85 L25,40 Z' },
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
  { name: 'Egypt', capital: 'Cairo', continent: 'Africa', landmark: 'Pyramids of Giza', trivia: 'Northeast African nation home to the Nile River and Great Sphinx', shapeSvg: 'M15,20 L85,20 L85,80 L15,80 Z' },
  { name: 'South Africa', capital: 'Pretoria', continent: 'Africa', landmark: 'Table Mountain (Cape Town)', trivia: 'Southernmost country in Africa' },
  { name: 'Nigeria', capital: 'Abuja', continent: 'Africa', landmark: 'Zuma Rock', trivia: 'Most populous country in Africa' },
  { name: 'Kenya', capital: 'Nairobi', continent: 'Africa', landmark: 'Maasai Mara', trivia: 'East African nation famous for scenic savannah safaris' },
  { name: 'Morocco', capital: 'Rabat', continent: 'Africa', landmark: 'Hassan II Mosque', trivia: 'Northwest African country bordering the Atlantic Ocean and Mediterranean Sea' },
  { name: 'Ghana', capital: 'Accra', continent: 'Africa', landmark: 'Cape Coast Castle', trivia: 'West African nation on the Gulf of Guinea' },
  { name: 'Ethiopia', capital: 'Addis Ababa', continent: 'Africa', landmark: 'Rock-Hewn Churches of Lalibela', trivia: 'Horn of Africa country that was never colonized' },
  { name: 'Tanzania', capital: 'Dodoma', continent: 'Africa', landmark: 'Mount Kilimanjaro', trivia: 'Home to Mount Kilimanjaro, the highest peak in Africa' },
  { name: 'Madagascar', capital: 'Antananarivo', continent: 'Africa', landmark: 'Avenue of the Baobabs', trivia: 'Fourth largest island in the world, located off southeast coast of Africa', shapeSvg: 'M35,15 L50,15 L45,85 L30,85 Z' },

  // Oceania
  { name: 'Australia', capital: 'Canberra', continent: 'Australia', landmark: 'Sydney Opera House', trivia: 'Sixth largest country by total area and the only country spanning an entire continent', shapeSvg: 'M20,30 L75,25 L85,55 L65,80 L35,80 L15,55 Z' },
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
