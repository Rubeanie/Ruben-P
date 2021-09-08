import './scrollbar.css';

export default function Scrollbar({children}) {
  return (
    <div className="scrollbar custom">
      {children}
    </div>
  );
}