import Link from 'next/link'
import Head from 'next/head'
import ReactPlayer from "react-player"

export default function Portfolio() {
  return (
    <div className='page'>
      <Head>
        <title>Portfolio</title>
        <meta name="description" content="Freelance creative developer / Ruben Panzich/ Rubeanie" />\
      </Head>
      <hero>
        <h1-image>Portfolio</h1-image>
        <p>AIT year 11 task work<br/>▼</p>
      </hero>
      <heros>
        {/* Task 1 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task1/Hardware.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 1<br/>Hardware Topic Test</h2>
                <p>Task 1 what about the hardware located in computers, like CPUs, GPUs operating systems and more.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task1/Task1.pdf" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 2 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task2/Camera.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 2<br/>Managing Data and Application Skills</h2>
                <p>In task 2 we wrote a extended answer on RAW files and a step by step plan on how a photographer
                  would use and convert them for publication.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task2/Managing Data and Application Skills - Ruben Panzich.docx" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 3 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task3/Sketches.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 3<br/>Design Concepts Topic Test</h2>
                <p>This task was a test on design concepts, more specifically the elements and principles of design
                   and Compositional Rules.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task3/Task3.pdf" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 4 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task4/Redesigned Arngren - Ruben Panzich.png' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 4<br/>Application Skills</h2>
                <p>In this task we had to put the design skills we had been learning to the test in Adobe Photoshop 
                  by redesigning the popular website "Arngren" using grid and alignment rules.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task4/Redesigned Arngren - Ruben Panzich.png" download><div className="button">Download PNG</div></a>
            <a href="/ait/Task4/Redesigned Arngren - Ruben Panzich.psd" download><div className="button">Download PSD</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 5 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task5/Art Gallery.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 5<br/>VR Art Gallery</h2>
                <p>Task 5 required us to create a virtual reality art gallery using Unity and Oculus Rifts to display 3D and 2D media. 
                  I chose to do mine on Syd Mead, the artist behind Tron and Bladerunner.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task5/VR Art Gallery - Ruben Panzich.zip" download><div className="button">Download App</div></a>
            <a href="/ait/Task5/VR Art Gallery Folio - Ruben Panzich.pptx" download><div className="button">Download Folio</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 6 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task6/Technology.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 6<br/>Impacts of Technology Topic Test</h2>
                <p>This topic test covers digital divide, cyber bullying, responsible use of social media, 
                  copyright and eCommerce.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task6/Task6.pdf" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 7 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task7/Exam.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 7<br/>Semester 1 Exam</h2>
                <p>The first semester's examination covered all of the topics which we had learnt. The exam also
                   included a section on design where we created a advertisement and annotate the design of another.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task7/Exam.pdf" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 8 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task8/Server.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 8<br/>Managing Data Topic Test</h2>
                <p>This topic test covered cloud computing and its uses, utility tools for
                   maintenance of data and boolean internet search.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task8/Task8.pdf" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 9 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <ReactPlayer
                  width={ "60%" }
                  height={ "auto" }
                  controls="true"
                  url="https://youtu.be/byu7tL9FvH8"
                />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 9<br/>Animation Task</h2>
                <p>Task 9 consisted of creating an advertisement banner for an event called "Battle of 
                  the Bands". It involved design, planning and creation using tool from Microsoft Excel 
                  to Adobe After Effects.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task9/Simple Animation - Ruben Panzich.pptx" download><div className="button">Download Folio</div></a>
            <a href="/ait/Task9/Simple Animation - Ruben Panzich.docx" download><div className="button">Download Journal</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 10 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task10/Answer.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 10<br/>Software Licensing Extended Answer</h2>
                <p>This extended answer entailed finding a software package and research it. 
                  This included the topic of licenses that cover the package and its intended 
                  use. I chose to cover the Substance 3D package.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task10/Extended Answer - Ruben Panzich.docx" download><div className="button">Download</div></a>
          </div>
        </div>
        <div className="line"/>
        {/* Task 11 */}
        <div className="flex-padding column">
          <div className="row">
            <div className="flex-padding flex-split">
              <div className="column">
                <img src={ '/ait/Task11/Network.webp' } width={ "60%" } />
              </div>
            </div>
            <div className="flex-padding flex-split">
              <div className="column">
                <h2>Task 11<br/>Networking Topic Test</h2>
                <p>This topic test covered network topologies and server networks.</p>
              </div>
            </div>
          </div>
          <div className="row">
            <a href="/ait/Task11/Task11.pdf" download><div className="button">Download</div></a>
          </div>
        </div>
      </heros>
    </div>
  )
}
