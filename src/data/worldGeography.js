// Static Geography Dataset for Kibo World

export const CONTINENTS = [
  { id: 'asia', name: 'Asia' },
  { id: 'africa', name: 'Africa' },
  { id: 'north_america', name: 'North America' },
  { id: 'south_america', name: 'South America' },
  { id: 'antarctica', name: 'Antarctica' },
  { id: 'europe', name: 'Europe' },
  { id: 'australia', name: 'Australia' }
];

export const OCEANS = [
  { id: 'pacific', name: 'Pacific', fullName: 'Pacific Ocean' },
  { id: 'atlantic', name: 'Atlantic', fullName: 'Atlantic Ocean' },
  { id: 'indian', name: 'Indian', fullName: 'Indian Ocean' },
  { id: 'southern', name: 'Southern', fullName: 'Southern Ocean' },
  { id: 'arctic', name: 'Arctic', fullName: 'Arctic Ocean' }
];

export const US_STATES = [
  { name: 'Alabama', capital: 'Montgomery' },
  { name: 'Alaska', capital: 'Juneau' },
  { name: 'Arizona', capital: 'Phoenix' },
  { name: 'Arkansas', capital: 'Little Rock' },
  { name: 'California', capital: 'Sacramento', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M20,20 L40,10 L50,30 L70,80 L60,90 L40,80 L20,40 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' },
  { name: 'Colorado', capital: 'Denver', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="20" width="80" height="60" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' },
  { name: 'Connecticut', capital: 'Hartford' },
  { name: 'Delaware', capital: 'Dover' },
  { name: 'Florida', capital: 'Tallahassee', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10,20 L50,20 L60,40 L90,80 L80,90 L50,50 L10,30 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' },
  { name: 'Georgia', capital: 'Atlanta' },
  { name: 'Hawaii', capital: 'Honolulu' },
  { name: 'Idaho', capital: 'Boise' },
  { name: 'Illinois', capital: 'Springfield' },
  { name: 'Indiana', capital: 'Indianapolis' },
  { name: 'Iowa', capital: 'Des Moines' },
  { name: 'Kansas', capital: 'Topeka' },
  { name: 'Kentucky', capital: 'Frankfort' },
  { name: 'Louisiana', capital: 'Baton Rouge' },
  { name: 'Maine', capital: 'Augusta' },
  { name: 'Maryland', capital: 'Annapolis' },
  { name: 'Massachusetts', capital: 'Boston' },
  { name: 'Michigan', capital: 'Lansing' },
  { name: 'Minnesota', capital: 'St. Paul' },
  { name: 'Mississippi', capital: 'Jackson' },
  { name: 'Missouri', capital: 'Jefferson City' },
  { name: 'Montana', capital: 'Helena' },
  { name: 'Nebraska', capital: 'Lincoln' },
  { name: 'Nevada', capital: 'Carson City' },
  { name: 'New Hampshire', capital: 'Concord' },
  { name: 'New Jersey', capital: 'Trenton' },
  { name: 'New Mexico', capital: 'Santa Fe' },
  { name: 'New York', capital: 'Albany' },
  { name: 'North Carolina', capital: 'Raleigh' },
  { name: 'North Dakota', capital: 'Bismarck' },
  { name: 'Ohio', capital: 'Columbus' },
  { name: 'Oklahoma', capital: 'Oklahoma City' },
  { name: 'Oregon', capital: 'Salem' },
  { name: 'Pennsylvania', capital: 'Harrisburg' },
  { name: 'Rhode Island', capital: 'Providence' },
  { name: 'South Carolina', capital: 'Columbia' },
  { name: 'South Dakota', capital: 'Pierre' },
  { name: 'Tennessee', capital: 'Nashville' },
  { name: 'Texas', capital: 'Austin', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10,20 L50,10 L90,40 L80,90 L40,80 L20,60 L10,50 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' },
  { name: 'Utah', capital: 'Salt Lake City' },
  { name: 'Vermont', capital: 'Montpelier' },
  { name: 'Virginia', capital: 'Richmond' },
  { name: 'Washington', capital: 'Olympia' },
  { name: 'West Virginia', capital: 'Charleston' },
  { name: 'Wisconsin', capital: 'Madison' },
  { name: 'Wyoming', capital: 'Cheyenne', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="15" y="25" width="70" height="50" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' }
];

// Focus on unambiguous, universally recognized countries for MVP
export const COUNTRIES = [
  { name: 'Canada', capital: 'Ottawa' },
  { name: 'Mexico', capital: 'Mexico City' },
  { name: 'United Kingdom', capital: 'London' },
  { name: 'France', capital: 'Paris' },
  { name: 'Germany', capital: 'Berlin' },
  { name: 'Italy', capital: 'Rome', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M30,20 L50,10 L60,40 L80,80 L60,90 L40,70 L30,50 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' },
  { name: 'Spain', capital: 'Madrid' },
  { name: 'Japan', capital: 'Tokyo', shapeSvg: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M70,10 L80,30 L60,60 L40,80 L20,90 L30,70 L50,40 Z" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/></svg>' },
  { name: 'China', capital: 'Beijing' },
  { name: 'India', capital: 'New Delhi' },
  { name: 'Brazil', capital: 'Brasília' },
  { name: 'Argentina', capital: 'Buenos Aires' },
  { name: 'Australia', capital: 'Canberra' },
  { name: 'Egypt', capital: 'Cairo' },
  { name: 'South Africa', capital: 'Pretoria' }
];
