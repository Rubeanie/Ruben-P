import Redirect from '../redirect';
import { BsTwitter } from 'react-icons/bs';

export const metadata = {
  title: 'Twitter | Ruben Panzich',
  description: 'Twitter redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero'>
        <Redirect
          name={'Twitter'}
          logo={<BsTwitter />}
          url={'https://twitter.com/TwitchRubeanie'}
        />
      </div>
    </div>
  );
}
