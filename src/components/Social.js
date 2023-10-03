export default function Social(props) {
  return (
    <div className='socials' style={{ background: props.color }}>
      <div className='row'>
        <div className='icon'>
          <div className='column'>
            <div
              style={{
                color: props.textColor,
                width: '100%',
                height: '100%'
              }}>
              <div className='column' style={{ fontSize: '70px' }}>
                {props.logo}
              </div>
            </div>
          </div>
        </div>
        <div className='text'>
          <div className='column'>
            <p style={{ color: props.textColor, overflow: 'visible' }}>
              <b>
                {props.name}
                <br />
                {props.username}
              </b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
