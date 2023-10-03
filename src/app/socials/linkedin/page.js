import Redirect from '../Redirect';
import { BsLinkedin } from 'react-icons/bs';

export const metadata = {
  title: 'LinkedIn | Ruben Panzich',
  description: 'LinkedIn redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero'>
        <Redirect
          name={'LinkedIn'}
          logo={<BsLinkedin />}
          url={'https://www.linkedin.com/in/ruben-p/'}
        />
      </div>
    </div>
  );
}
