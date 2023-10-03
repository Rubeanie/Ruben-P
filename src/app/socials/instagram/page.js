import Redirect from '../redirect';
import { BsInstagram } from 'react-icons/bs';

export const metadata = {
  title: 'Instagram | Ruben Panzich',
  description: 'Instagram redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero'>
        <Redirect
          name={'Instagram'}
          logo={<BsInstagram />}
          url={'https://www.instagram.com/ruben.panzich/'}
        />
      </div>
    </div>
  );
}
