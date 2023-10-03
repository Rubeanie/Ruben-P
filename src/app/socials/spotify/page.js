import Redirect from '../redirect';
import { BsSpotify } from 'react-icons/bs';

export const metadata = {
  title: 'Spotify | Ruben Panzich',
  description: 'Spotify redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero'>
        <Redirect
          name={'Spotify'}
          logo={<BsSpotify />}
          url={'https://open.spotify.com/user/rubeanie?si=87761d3bc88f4fcc'}
        />
      </div>
    </div>
  );
}
