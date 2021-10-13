import Head from 'next/head'

export default function About() {
  return (
    <page>
      <Head>
        <title>About</title>
        <meta name="description" content="Freelance creative developer / Ruben Panzich/ Rubeanie" />\
      </Head>
      <hero>
        <div width={ "33%" }>
          <img src={ '/images/School-Photo.webp' } alt="A photo of Ruben Panzich" className='global-padding' width={ "100%" } />
        </div>
        <table width={ "67%" }>
          <h1-image>ABOUT</h1-image>
        </table>
      </hero>
    </page>
  )
}
