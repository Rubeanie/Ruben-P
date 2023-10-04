import Redirect from '../Redirect';
import { BsGithub } from 'react-icons/bs';

export const metadata = {
  title: 'Github | Ruben Panzich',
  description: 'Github redirect.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero-no-padding'>
        <Redirect
          name={'Github'}
          logo={<BsGithub />}
          url={'https://github.com/Rubeanie'}
        />
      </div>
    </div>
  );
}
