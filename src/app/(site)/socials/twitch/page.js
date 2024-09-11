import Redirect from '../Redirect';
import { BsTwitch } from 'react-icons/bs';

export const metadata = {
  title: 'Twitch | Ruben Panzich',
  description: 'Twitch redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero-no-padding'>
        <Redirect
          name={'Twitch'}
          logo={<BsTwitch />}
          url={'https://www.twitch.tv/Rubeanie'}
        />
      </div>
    </div>
  );
}
