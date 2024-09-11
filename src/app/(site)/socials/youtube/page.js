import Redirect from '../Redirect';
import { BsYoutube } from 'react-icons/bs';

export const metadata = {
  title: 'YouTube | Ruben Panzich',
  description: 'YouTube redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero-no-padding'>
        <Redirect
          name={'YouTube'}
          logo={<BsYoutube />}
          url={'https://www.youtube.com/channel/UCV3-uGgDO32_MTii2006g-Q'}
        />
      </div>
    </div>
  );
}
