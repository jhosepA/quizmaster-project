import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; // Importaremos un archivo CSS para los estilos

function HomePage() {
  // 'shareCode' guardará el valor del input. 'setShareCode' es la función para actualizarlo.
  const [shareCode, setShareCode] = useState('');
  const navigate = useNavigate(); // Hook para la navegación

  // Esta función se ejecuta cada vez que el usuario presiona el botón "Buscar Quiz"
  const handleSubmit = (event) => {
    // Prevenimos el comportamiento por defecto del formulario (que es recargar la página)
    event.preventDefault(); 
    
    // Verificamos que el código no esté vacío (quitando espacios en blanco)
    if (shareCode.trim()) {
      // Usamos navigate para redirigir al usuario a la página del quiz
      // Por ejemplo, si el código es 'a1b2c3', la URL será '/quiz/a1b2c3'
      navigate(`/quiz/${shareCode.trim()}`);
    } else {
      // Opcional: podrías mostrar un error si el campo está vacío
      alert("Por favor, introduce un código de quiz.");
    }
  };

  return (
    <div className="homepage-container">
      <h2>Únete a un Quiz</h2>
      <p>Introduce el código compartido por tu profesor para empezar.</p>
      <form onSubmit={handleSubmit} className="join-form">
        <input 
          type="text"
          placeholder="Código del Quiz"
          className="code-input"
          value={shareCode} // El valor del input está ligado al estado de React
          onChange={(e) => setShareCode(e.target.value)} // Cuando el usuario escribe, actualizamos el estado
          maxLength="6" // Limitamos a 6 caracteres, como en nuestro backend
        />
        <button type="submit" className="join-button">
          Unirse
        </button>
      </form>
      <footer className="credits-footer">
        <p>🏆 Creado por:</p>
        <p>Jhosep Vargas</p>
        <p>Daniel Cachon</p>
        <p>Daniel De Santis</p>
        <p>Rafael Guedez</p>
        <p>Jose Cuello</p>
      </footer>
    </div>
  );
}

export default HomePage;