import Link from 'next/link'

const Footer = () => {
  return (
    <div className='foot'> 
      <div>
        <div className="column" style={{ alignItems: 'flex-start' }}>
          <foot-info>© 2021 by Ruben Panzich</foot-info>
          <Link href='https://github.com/Rubeanie/Personal-Website'>
            <a><foot-github>Source code on GitHub</foot-github></a>
          </Link>
        </div>
      </div>
      <div>
        <div className="column" style={{ alignItems: 'flex-end' }}>
          <foot-contact>Phone: +61 427 531 712</foot-contact>
          <foot-contact>Email: panziri@students.hale.wa.edu.au</foot-contact>
        </div>
      </div>
    </div>
  )
}

export default Footer
