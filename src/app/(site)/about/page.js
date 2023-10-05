import {
  SiCplusplus,
  SiCsharp,
  SiHtml5,
  SiReact,
  SiCss3,
  SiSass,
  SiJavascript,
  SiNextdotjs,
  SiTypescript,
  SiNodedotjs,
  SiAdobeaftereffects,
  SiAdobepremierepro,
  SiAdobeaudition,
  SiAdobephotoshop,
  SiAdobeillustrator,
  SiBlender
} from 'react-icons/si';
import {
  AiFillCaretDown
} from 'react-icons/ai';
import {
  RpSubstanceSampler,
  RpSubstancePainter,
  RpUnity
} from '../../../lib/icons';
import Skill from '../../../components/Skill';
import { AboutPageContent } from './content';
import { PersonalPhoto } from './client';

export const metadata = {
  title: 'About | Ruben Panzich',
  description: 'More information about Ruben Panzich.'
};

export default function page() {
  return (
    <div className='page'>
      <div className='hero'>
        <div className='row'>
          <div className='flex-padding' style={{ flex: '40%' }}>
            <div className='column'>
              <PersonalPhoto />
              <h2>
                -Ruben.P
                <br />
                <AiFillCaretDown />
              </h2>
            </div>
          </div>
          <div className='flex-padding' style={{ flex: '60%' }}>
            <div className='column'>
              <h1 className='img-heading'>ABOUT</h1>
            </div>
          </div>
        </div>
      </div>
      <div className='hero-content'>
        <div className='column'>
          <AboutPageContent />
          <div className='flex-box'>
            <div className='item shadow'>
              <Skill
                name={'C++'}
                logo={<SiCplusplus />}
                textColor={'#121212'}
                color={'#3b95cd'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'C#'}
                logo={<SiCsharp />}
                textColor={'#121212'}
                color={'#53BC50'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'HTML5'}
                logo={<SiHtml5 />}
                textColor={'#121212'}
                color={'#E35D38'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'React'}
                logo={<SiReact />}
                textColor={'#121212'}
                color={'#61DAFB'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'CSS3'}
                logo={<SiCss3 />}
                textColor={'#121212'}
                color={'#3880B6'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'SASS'}
                logo={<SiSass />}
                textColor={'#121212'}
                color={'#cc6699'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Javascript'}
                logo={<SiJavascript />}
                textColor={'#121212'}
                color={'#F7E454'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Next.js'}
                logo={<SiNextdotjs />}
                textColor={'#121212'}
                color={'#FFFFFF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Typescript'}
                logo={<SiTypescript />}
                textColor={'#121212'}
                color={'#2C8BCC'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Node.js'}
                logo={<SiNodedotjs />}
                textColor={'#121212'}
                color={'#4D994D'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'After Effects'}
                logo={<SiAdobeaftereffects />}
                textColor={'#121212'}
                color={'#9999FF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Premiere Pro'}
                logo={<SiAdobepremierepro />}
                textColor={'#121212'}
                color={'#9999FF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Audition'}
                logo={<SiAdobeaudition />}
                textColor={'#121212'}
                color={'#9999FF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Photoshop'}
                logo={<SiAdobephotoshop />}
                textColor={'#121212'}
                color={'#31a8ff'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Illustrator'}
                logo={<SiAdobeillustrator />}
                textColor={'#121212'}
                color={'#ff9a00'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Substance Painter'}
                logo={<RpSubstanceSampler />}
                textColor={'#121212'}
                color={'#8ad137'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Substance Sampler'}
                logo={<RpSubstancePainter />}
                textColor={'#121212'}
                color={'#8ad137'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Blender'}
                logo={<SiBlender />}
                textColor={'#121212'}
                color={'#DC872D'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                name={'Unity'}
                logo={<RpUnity />}
                textColor={'#121212'}
                color={'#2d7b97'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
