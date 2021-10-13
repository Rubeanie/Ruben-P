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
          <h1-image>ABOUT</h1-image>
        </div>
        <div className="row">
            <div className='container'>
              <div className='item'> <h2>test 123</h2> </div>
              <div className='item'> <h2>test 123</h2> </div>
              <div className='item'> <h2>test 123</h2> </div>
              <div className='item'> <h2>test 123</h2> </div>
              <div className='item'> <h2>test 123</h2> </div>
              <div className='item'> <h2>test 123</h2> </div>
              <div className='item'> <h2>test 123</h2> </div>
          </div>
        </div>


        {/* <div width={ "33%" }>
          <img src={ '/images/School-Photo.webp' } alt="A photo of Ruben Panzich" width={ "100%" } />
        </div>
        <table width={ "67%" }>
          
        </table> */}
      </hero>
    </div>
  )
}
