import type { Service, ServiceCategory } from '../types/booking';

export const services: Service[] = [
{
  id: 'cut-finish',
  name: 'Cut & Finish',
  description: 'Consultation, precision cut, and a blow-dry finish.',
  durationMinutes: 60,
  price: 78,
  category: 'Cut & Style',
  mostBooked: true
},
{
  id: 'blow-dry',
  name: 'Blow Dry & Style',
  description: 'Wash, style, and a light finishing polish.',
  durationMinutes: 45,
  price: 46,
  category: 'Cut & Style'
},
{
  id: 'fringe-trim',
  name: 'Fringe Trim',
  description: 'A quick reshape between full appointments.',
  durationMinutes: 15,
  price: 14,
  category: 'Cut & Style'
},
{
  id: 'full-colour',
  name: 'Full Colour',
  description: 'Single-tone colour with gloss and blow-dry.',
  durationMinutes: 120,
  price: 165,
  category: 'Colour'
},
{
  id: 'balayage',
  name: 'Balayage',
  description: 'Hand-painted lightening, toner, and finish.',
  durationMinutes: 180,
  price: 240,
  category: 'Colour'
},
{
  id: 'root-touch',
  name: 'Root Touch-Up',
  description: 'Regrowth colour matched to your existing tone.',
  durationMinutes: 75,
  price: 92,
  category: 'Colour'
},
{
  id: 'gloss',
  name: 'Shine Gloss',
  description: 'Ammonia-free gloss to refresh tone and shine.',
  durationMinutes: 30,
  price: 38,
  category: 'Treatments'
},
{
  id: 'bond-repair',
  name: 'Bond Repair Ritual',
  description: 'Two-stage strengthening treatment with scalp massage.',
  durationMinutes: 45,
  price: 64,
  category: 'Treatments'
}];


export const serviceCategories: ServiceCategory[] = [
'Cut & Style',
'Colour',
'Treatments'];