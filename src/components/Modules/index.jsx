/* Import module types */

export function Modules({modules, page}) {
  return (
    <>
      {modules.map((module) => {
        switch (module._type) {
          case '':
            return <div key={module._key}></div>;
          
          default:
            return <p key={module._key}>Error Data type mismatch</p>;
        }
      })}
    </>
  )
}