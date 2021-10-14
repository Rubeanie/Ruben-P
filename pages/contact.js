import Head from 'next/head'

export default function Contact() {
  return (
    <div className='page'>
      <Head>
        <title>Contact</title>
        <meta name="description" content="Freelance creative developer / Ruben Panzich/ Rubeanie" />
      </Head>
      <hero>
        <h1-image>CONTACT</h1-image>
        <p>If you would for any reason like to contact me you can do so through:</p>
        <div className="row">
          <div className="flex-split">
            <div className="column">
              <h2>Phone</h2>
              <p>+61 427 531 712</p>
            </div>
          </div>
          <div className="flex-split">
            <div className="column">
              <h2>Email</h2>
              <p>panziri@students.hale.wa.edu.au</p>
            </div>
          </div>
        </div>
      </hero>
    </div>
  )
}
