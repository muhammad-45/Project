import './Loader.css';

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className="loader-container" id="loader">
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loader-text">{text}</p>
    </div>
  );
};

export default Loader;
