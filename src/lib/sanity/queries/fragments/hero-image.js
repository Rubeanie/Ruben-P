import groq from 'groq';
import { cloudinaryStillQuery } from './cloudinary';

// A hero module's photo, under whichever field its type keeps it in
// (heroPhoto picks), as far as its still.
export const heroImageQuery = groq`
  bgImage{ ${cloudinaryStillQuery} },
  image{ ${cloudinaryStillQuery} }
`;
