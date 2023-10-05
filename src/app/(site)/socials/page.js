import Social from '../../../components/Social';
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

export const metadata = {
  title: 'Socials | Ruben Panzich',
  description: "Ruben Panzich's other social links."
};

export default function Socials() {
  return (
    <div className='page'>
      <div className='hero'>
        <div className='column'>
          <h2>Socials</h2>
          <a href='/socials/linkedin' target='_blank'>
            <Social
              heading={'LinkedIn'}
              subheading={'Ruben Panzich'}
              logo={<BsLinkedin />}
              color={'#0d86ff'}
            />
          </a>
          <a href='/socials/github' target='_blank'>
            <Social
              heading={'Github'}
              subheading={'@Rubeanie'}
              logo={<BsGithub />}
              color={'#e1e8ed'}
            />
          </a>
          <a href='/socials/youtube' target='_blank'>
            <Social
              heading={'YouTube'}
              subheading={'@Rubeanie'}
              logo={<BsYoutube />}
              color={'#c4302b'}
            />
          </a>
          <a href='/socials/twitch' target='_blank'>
            <Social
              heading={'Twitch'}
              subheading={'@Rubeanie'}
              logo={<BsTwitch />}
              color={'#6441a5'}
            />
          </a>
          <a href='/socials/twitter' target='_blank'>
            <Social
              heading={'Twitter'}
              subheading={'@TwitchRubeanie'}
              logo={<BsTwitter />}
              color={'#1da1f2'}
            />
          </a>
          <a href='/socials/instagram' target='_blank'>
            <Social
              heading={'Instagram'}
              subheading={'@ruben.panzich'}
              logo={<BsInstagram />}
              color={'#f09433'}
            />
          </a>
          <a href='/socials/spotify' target='_blank'>
            <Social
              heading={'Spotify'}
              subheading={'@ruben'}
              logo={<BsSpotify />}
              color={'#1DB954'}
            />
          </a>
          <a href='/socials/steam' target='_blank'>
            <Social
              heading={'Steam'}
              subheading={'@rubeanie'}
              logo={<FaSteam />}
              color={'#66c0f4'}
            />
          </a>
          <Link href='/contact' passHref>
            <Social
              heading={'Contact'}
              subheading={'Information'}
              logo={<FaWpforms />}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
