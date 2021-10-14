import Head from 'next/head'

export default function About() {
  return (
    <div className='page'>
      <Head>
        <title>About</title>
        <meta name="description" content="Freelance creative developer / Ruben Panzich/ Rubeanie" />\
      </Head>
      <hero>
        <div className="row">
          <div className="flex-div" flex-size="30%" >
            <img src={ '/images/School-Photo.webp' } alt="A photo of Ruben Panzich" width={ "100%" } />
            <h2>test 123</h2>
          </div>
          <div className="flex-div" flex-size="70%" >
            <div className="row">
              <h1-image>ABOUT</h1-image>
            </div>
            
            <h2>test 123</h2>
            <h2>test 123</h2>
            <h2>test 123</h2>
            <h2>test 123</h2>
            <h2>test 123</h2>
            <h2>test 123</h2>
          </div>
        </div>


        {/* <div width={ "33%" }>
          
        </div>
        <table width={ "67%" }>
          
        </table> */}
      </hero>
    </div>
  )
}
