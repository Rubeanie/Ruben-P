import styles from '@/styles/pages/about.module.scss';
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
} from '@/utils/icons';
import Skill from '@/components/Skill';
import { AboutPageContent } from './content';
import { PersonalPhoto } from './client';

export const metadata = {
  title: 'About | Ruben Panzich',
  description: 'More information about Ruben Panzich.'
};

export default function page() {
  return (
    <div className='page'>
      <div className={`hero ${styles.about}`}>
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
      <div className='content'>
        <div className='column'>
          <AboutPageContent />
          <div className='flex-box'>
            <div className='item shadow'>
              <Skill
                heading={'C++'}
                logo={<SiCplusplus />}
                color={'#3b95cd'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'C#'}
                logo={<SiCsharp />}
                color={'#53BC50'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'HTML5'}
                logo={<SiHtml5 />}
                color={'#E35D38'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'React'}
                logo={<SiReact />}
                color={'#61DAFB'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'CSS3'}
                logo={<SiCss3 />}
                color={'#3880B6'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'SASS'}
                logo={<SiSass />}
                color={'#cc6699'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Javascript'}
                logo={<SiJavascript />}
                color={'#F7E454'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Next.js'}
                logo={<SiNextdotjs />}
                color={'#FFFFFF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Typescript'}
                logo={<SiTypescript />}
                color={'#2C8BCC'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Node.js'}
                logo={<SiNodedotjs />}
                color={'#4D994D'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'After Effects'}
                logo={<SiAdobeaftereffects />}
                color={'#9999FF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Premiere Pro'}
                logo={<SiAdobepremierepro />}
                color={'#9999FF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Audition'}
                logo={<SiAdobeaudition />}
                color={'#9999FF'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Photoshop'}
                logo={<SiAdobephotoshop />}
                color={'#31a8ff'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Illustrator'}
                logo={<SiAdobeillustrator />}
                color={'#ff9a00'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Substance Painter'}
                logo={<RpSubstanceSampler />}
                color={'#8ad137'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Substance Sampler'}
                logo={<RpSubstancePainter />}
                color={'#8ad137'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Blender'}
                logo={<SiBlender />}
                color={'#DC872D'}
              />
            </div>
            <div className='item shadow'>
              <Skill
                heading={'Unity'}
                logo={<RpUnity />}
                color={'#2d7b97'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
