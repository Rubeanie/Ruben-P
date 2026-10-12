import groq from 'groq';

export const categoryQuery = groq`
  _id,
  title,
  color { hex }
`;
