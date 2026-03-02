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
      'Great vibes, killer cocktails, and genuinely warm service. The room can get loud with packed tables, music, and conversation bouncing off the walls, but that energy is exactly what makes it a fun, lively night. Order a couple of mezcal margaritas and lean into it.',
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
      'Tucked into a quiet Noe Valley block, Firefly is the rare place where everything feels considered: the ingredients, the technique, the wine list. Low lighting and a relaxed residential setting make it genuinely romantic. The food is the main event, and it earns it.',
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
      'Start with the cocktail program, it is genuinely interesting and worth exploring before you even open the food menu. The kitchen is precise and generous with the roll options, making it easy to build a meal that feels celebratory without being stuffy. Well-executed across the board.',
    favoriteDish: 'Futomaki roll',
    website: 'https://www.iyasare-berkeley.com',
  },
  {
    id: 4,
    name: 'Mensho',
    neighborhood: 'Oakland',
    address: '4258 Piedmont Ave, Oakland, CA',
    lat: 37.8282,
    lng: -122.2496,
    cuisine: 'Ramen',
    blurb:
      'No reservations, so plan around the wait. It is absolutely worth it. This is a more casual date night, the kind where you stand outside talking while the line moves and arrive at the table already in a good mood. The edamame and corn wings are must-orders before the bowls land.',
    favoriteDish: 'Garlic knockout',
    website: 'https://www.menshopiedmont.com',
  },
  {
    id: 5,
    name: 'Parche',
    neighborhood: 'Oakland',
    address: '2295 Broadway, Oakland, CA',
    lat: 37.8126,
    lng: -122.2673,
    cuisine: 'Colombian',
    blurb:
      'The cocktails here are exceptional, creative, detailed, and clearly made by people who care. The food follows the same logic with unique combinations, bold flavors, and nothing ordinary on the menu. It feels elevated without being stiff, perfect for a fancier night out that still has personality and a pulse.',
    favoriteDish: 'Costilla negra',
    website: 'https://www.parcheoak.com',
  },
]

export const MAP_CENTER: [number, number] = [37.81, -122.34]
export const MAP_ZOOM = 11
