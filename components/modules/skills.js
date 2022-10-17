import React from 'react'

import Image from 'next/image'
import Skill from '../Skill'
import SVG, { Props as SVGProps } from 'react-inlinesvg'

const Skills = ({ data = {} }) => {
  const { skills } = data
  console.log(data)

  return (
    <div className="flex-box">
      {skills.map((skill) => (
        <a key={skill._key} className="item shadow" href={skill.url} target="_blank" rel="noreferrer">
          <Skill
            name={skill.name}
            logo={<SVG src={skill.logo} />}
            textColor={skill.textColor.hex}
            color={skill.baseColor.hex}
          />
        </a>
      ))}
    </div>
  )
}

export default Skills
