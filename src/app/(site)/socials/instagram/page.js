import Redirect from '../Redirect';
import { BsInstagram } from 'react-icons/bs';

export const metadata = {
  title: 'Instagram | Ruben Panzich',
  description: 'Instagram redirect.'
};

export default function page() {
  return (
    <>
      <div className='hero-no-padding'>
        <Redirect
          name={'Instagram'}
          logo={<BsInstagram />}
          url={'https://www.instagram.com/ruben.panzich/'}
        />
      </div>
    </>
  );
}
