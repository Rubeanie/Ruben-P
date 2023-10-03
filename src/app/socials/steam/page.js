import Redirect from '../redirect';
import { FaSteam } from 'react-icons/fa';

export const metadata = {
  title: 'Steam | Ruben Panzich',
  description: 'Steam redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero'>
        <Redirect
          name={'Steam'}
          logo={<FaSteam />}
          url={'https://steamcommunity.com/id/Rubeanie/'}
        />
      </div>
    </div>
  );
}
