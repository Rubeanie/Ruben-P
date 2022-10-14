import React from 'react'

import Image from 'next/image'
import Skill from '../Skill'
import { imageUrl } from '../../lib/sanity'

const Skills = ({ data = {} }) => {
  const { skills } = data
  console.log(data)

  return (
    <div className="hero">
      <div className="column">
        <div className="flex-box">
          {skills.map((skill) => (
            <div key={skill._key} className="item shadow">
              <a href={skill.url}>
                <Skill
                  name={skill.name}
                  logo={
                    <img 
                      src={imageUrl(skill.image).url()}
                      alt={`${skill.name} Logo`}
                      style={{ width: "1em", height: "1em" }}
                    />
                  }
                  /* logo={skill.needToFix} */
                  textColor={skill.textColor.hex}
                  color={skill.baseColor.hex}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skills
