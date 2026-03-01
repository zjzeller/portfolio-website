import type { FoodSpot } from '@/types/food-spots'

export const SF_FOOD_SPOTS: FoodSpot[] = [
  {
    id: 1,
    name: 'Bombera',
    neighborhood: 'Oakland',
    address: '3459 Champion St, Oakland, CA',
    lat: 37.769,
    lng: -122.2035,
    cuisine: 'Mexican',
    blurb:
      'A wood-fire Mexican kitchen in Oakland celebrating the culinary traditions of Veracruz. The room is warm and the cooking is bold — this place earns every reservation.',
    favoriteDish: 'Spicy Carrots Toasted Almond Misantla',
    website: 'https://www.bomberaoakland.com',
  },
  {
    id: 2,
    name: 'Firefly Restaurant',
    neighborhood: 'San Francisco',
    address: '4288 24th St, San Francisco, CA',
    lat: 37.7503,
    lng: -122.4316,
    cuisine: 'New American',
    blurb:
      'A Noe Valley neighborhood gem that has been quietly perfecting its craft for decades. Intimate, consistent, and genuinely romantic — the kind of place that becomes a ritual.',
    favoriteDish: 'Japanese sweet potato tostones',
    website: 'https://www.fireflysf.com',
  },
  {
    id: 3,
    name: 'Iyasare',
    neighborhood: 'Berkeley',
    address: '1830 4th St, Berkeley, CA',
    lat: 37.8691,
    lng: -122.2967,
    cuisine: 'Japanese',
    blurb:
      'Contemporary Japanese cuisine on 4th Street with a focus on seasonal ingredients and refined technique. The omakase spirit shows in every dish — precise, beautiful, memorable.',
    favoriteDish: 'Futomaki roll',
    website: 'https://www.iyasare-berkeley.com',
  },
  {
    id: 4,
    name: 'Mensho Tokyo',
    neighborhood: 'San Francisco',
    address: '672 Geary St, San Francisco, CA',
    lat: 37.7869,
    lng: -122.4151,
    cuisine: 'Ramen',
    blurb:
      'The SF outpost of a legendary Tokyo ramen master. The broth takes days to build and it shows. Worth the wait, worth the trip, worth every calorie.',
    favoriteDish: 'Garlic knockout',
    website: 'https://www.mensho.com',
  },
  {
    id: 5,
    name: 'Imm Thai Street Food',
    neighborhood: 'Berkeley',
    address: '2068 University Ave, Berkeley, CA',
    lat: 37.8732,
    lng: -122.2703,
    cuisine: 'Thai',
    blurb:
      'Authentic Thai street food that punches well above its casual setting. Fragrant, vibrant, and deeply satisfying — a reliable favorite when Berkeley calls.',
    favoriteDish: 'Costilla negra',
    website: 'https://www.immthaistreetfood.com',
  },
]

export const MAP_CENTER: [number, number] = [37.81, -122.34]
export const MAP_ZOOM = 11
