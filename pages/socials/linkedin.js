import Head from 'next/head';
import Redirect from '../../components/Redirect';
import { BsLinkedin } from 'react-icons/bs';

export default function DiscordLink() {
  return (
    <div className='page'>
      <Head>
        <title>LinkedIn</title>
      </Head>
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
