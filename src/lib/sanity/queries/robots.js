import groq from 'groq';

export const robotsQuery = groq`*[_type == 'site'][0]{ 'disallow': robotsDisallow }`;
