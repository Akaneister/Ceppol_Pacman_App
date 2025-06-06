// src/components/pages/Home/ErrorMessage.js
const ErrorMessage = ({ message }) => (
  <div className="error-message">
    <p>{message}</p>
    <button onClick={() => window.location.reload()}>Réessayer</button>
  </div>
);

export default ErrorMessage;
