interface DetailedLocation {
  neighborhood: string
  streetAddress: string
  city: string
  stateCode: string
  state: string
  zipCode: string
}
export function parseDetailedLocations(input: string): DetailedLocation[] {
  const locationStrings = input.split(';').map(s => s.trim())
  const locations: DetailedLocation[] = locationStrings.map(locationString => {
    const parts = locationString.split(',').map(part => part.trim())

    // Assuming the last part is ZIP, second last is state code, first is neighborhood
    const zipAndState = parts.pop() || '' // Last part is ZIP code + state code
    // split last part by space to separate ZIP and state code
    const zipAndStateParts = zipAndState.split(' ')
    const stateCode = zipAndStateParts.shift() || '' // First part is state code
    const zipCode = zipAndStateParts.pop() || '' // Second part is ZIP code

    const neighborhood = parts.shift() || '' // First part is neighborhood
    const city = parts.pop() || '' // Pop again for city, after neighborhood is removed

    // The remaining parts are the street address
    const streetAddress = parts.join(', ')

    // Convert state code to full name
    const state = stateMap[stateCode.toUpperCase()] || stateCode // Fallback to the code if not found

    return { neighborhood, streetAddress, city, stateCode, state, zipCode }
  })
  return locations
}

const stateMap: { [code: string]: string } = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
}

// const example1 =
//   'The Daily - King St, 652 B King St, Charleston, SC 29403; The Daily - Northside Pkwy, 3705 Northside Pkwy NW, Suite 300 Atlanta, GA 30327; The Daily - Hurt St, 100 Hurt St NE, Atlanta, GA 30307; The Daily - Trabert Ave, 763 Trabert Ave NW , Atlanta, GA 30318'
// const example2 = 'Nolita, 51 Spring Street, New York, NY 10012'
// const example3 = 'Soho, 265 Canal St, New York, NY 10013'
// const example4 = 'Downtown Charleston, 710 King St, Charleston, SC 29403'
// const example5 = 'Pier 57, 25 11th Ave Kiosk 11, New York, NY 10011; Nolita, 10 Kenmare St, New York, NY 10012'
