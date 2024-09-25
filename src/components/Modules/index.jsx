import CustomHTML from "./CustomHTML";

export function Modules({modules, page}) {
  return (
    <>
      {modules.map((module) => {
        switch (module._type) {
          case 'custom-html':
            return <CustomHTML {...module} key={module._key} />;

          default:
            return <p key={module._key}>Error Data type mismatch, {module._type} does not exist</p>; // TODO Implement a error boundary
        }
      })}
    </>
  )
}