import Head from 'next/head';
import Social from '../../components/Social';
import Var from '../../styles/abstracts/_colors.module.scss';
import {
  BsTwitch,
  BsYoutube,
  BsLinkedin,
  BsSpotify,
  BsInstagram,
  BsTwitter,
  BsGithub
} from 'react-icons/bs';
import { FaSteam, FaWpforms } from 'react-icons/fa';
import Link from 'next/link';

export default function links() {
  return (
    <div className='page'>
      <Head>
        <title>Socials | Ruben Panzich</title>
        <meta
          name='description'
          content="Ruben Panzich's other social links."
        />
        <meta key='robots' name='robots' content='index,follow' />
        <meta key='googlebot' name='googlebot' content='index,follow' />
      </Head>
      <div className='hero'>
        <div className='column'>
          <h2>Socials</h2>
          <a href='/socials/linkedin' target='_blank'>
            <Social
              name={'LinkedIn'}
              logo={<BsLinkedin />}
              username={'Ruben Panzich'}
              textColor={'#121212'}
              color={'#0d86ff'}
            />
          </a>
          <a href='/socials/github' target='_blank'>
            <Social
              name={'Github'}
              logo={<BsGithub />}
              username={'@Rubeanie'}
              textColor={'#121212'}
              color={'#e1e8ed'}
            />
          </a>
          <a href='/socials/youtube' target='_blank'>
            <Social
              name={'YouTube'}
              logo={<BsYoutube />}
              username={'@Rubeanie'}
              textColor={'#121212'}
              color={'#c4302b'}
            />
          </a>
          <a href='/socials/twitch' target='_blank'>
            <Social
              name={'Twitch'}
              logo={<BsTwitch />}
              username={'@Rubeanie'}
              textColor={'#121212'}
              color={'#6441a5'}
            />
          </a>
          <a href='/socials/twitter' target='_blank'>
            <Social
              name={'Twitter'}
              logo={<BsTwitter />}
              username={'@TwitchRubeanie'}
              textColor={'#121212'}
              color={'#1da1f2'}
            />
          </a>
          <a href='/socials/instagram' target='_blank'>
            <Social
              name={'Instagram'}
              logo={<BsInstagram />}
              username={'@ruben.panzich'}
              textColor={'#121212'}
              color={'#f09433'}
            />
          </a>
          <a href='/socials/spotify' target='_blank'>
            <Social
              name={'Spotify'}
              logo={<BsSpotify />}
              username={'@ruben'}
              textColor={'#121212'}
              color={'#1DB954'}
            />
          </a>
          <a href='/socials/steam' target='_blank'>
            <Social
              name={'Steam'}
              logo={<FaSteam />}
              username={'@rubeanie'}
              textColor={'#121212'}
              color={'#66c0f4'}
            />
          </a>
          <Link href='/contact' passHref>
            <Social
              name={'Contact'}
              logo={<FaWpforms />}
              username={'Information'}
              textColor={'#121212'}
              color={Var.color_primary}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
