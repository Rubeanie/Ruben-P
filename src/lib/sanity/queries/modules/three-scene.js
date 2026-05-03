import { groq } from '../../fetch';
import { contentQuery } from '../fragments/content';
import { cloudinaryQuery } from '../fragments/cloudinary';

export const threeSceneQuery = groq`
  intro[]{ ${contentQuery} },
  model { ${cloudinaryQuery} },
  lights { hex },
  background { hex },
  orbitControls,
  zoom
`;
