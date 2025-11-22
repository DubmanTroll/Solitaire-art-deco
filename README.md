# Solitario Art Deco ♠️♦️♣️♥

Un juego de Solitario Klondike clásico reimaginado con una estética elegante Art Deco de los años 20. Este proyecto combina diseño visual CSS avanzado con lógica de juego en JavaScript y asistencia de IA.



## 🔗 Jugar Ahora
[Haz clic aquí para ver el juego en vivo](https://dubmantroll.github.io/Solitaire-art-deco/)

## ✨ Características Principales
* **Estética 100% Art Deco:** Diseño visual personalizado con paleta de colores dorados, negros y crema.
* **Asistente de IA:** Integración con la API de Gemini para dar pistas inteligentes sobre el mejor movimiento.
* **Sistema de Puntuación:** Reglas clásicas con bonificaciones y penalizaciones.
* **Dos Modos de Dificultad:** Fácil (Robar 1) y Realista (Robar 3).
* **Totalmente Responsivo:** Funciona en escritorio, tablets y móviles (con soporte touch).
* **Animaciones Fluidas:** Efectos de rebote y arrastre suave.

## 🛠️ Tecnologías Usadas
* **HTML5:** Estructura semántica.
* **CSS3:** Variables, Flexbox, Grid, Animaciones y Media Queries.
* **JavaScript (Vanilla):** Lógica del juego, manipulación del DOM y llamadas a API asíncronas.
* **Google Gemini API:** Para la generación de pistas.

## 🚀 Cómo ejecutarlo localmente
1.  Clona este repositorio.
2.  Abre el archivo `index.html` en tu navegador web favorito.
3.  ¡A jugar!

## ✒️ Autor
**Designed by SPHERE**

#Documentación del Juego: Solitario Art Deco
## 1. Introducción
Este documento proporciona una explicación técnica detallada del juego "Solitario Art Deco", una aplicación web de una sola página que implementa el clásico juego de cartas Solitario (Klondike) con una estética Art Deco.
El juego está desarrollado en HTML, CSS y JavaScript puros, sin dependencias de frameworks externos. Sus características principales incluyen:
* **Diseño Responsivo:** Se adapta a cualquier tamaño de pantalla, desde móviles hasta escritorios.
* **Dos Modos de Dificultad:** "Fácil" (roba 1 carta) y "Realista" (roba 3 cartas).
* **Sistema de Puntuación:** Implementa un sistema de puntos basado en reglas y restricciones específicas.
* **Funcionalidades Adicionales:** Incluye botones para "Deshacer Movimiento", "Nueva Partida" y una "Pista" generada por IA.
* **Estilo Visual Cuidado:** Una interfaz con temática Art Deco, animaciones fluidas y alta atención al detalle.
* **Compatibilidad Táctil:** Permite jugar arrastrando y soltando cartas en dispositivos táctiles.
## 2. Estructura del Archivo (solitaire_art_deco.html)
El proyecto está contenido en un único archivo HTML, lo que simplifica su distribución y despliegue. El archivo se divide en tres secciones principales:
1.   HTML (<body>): Define la estructura semántica de la interfaz del juego, incluyendo el tablero, los botones y las ventanas modales.
2.  CSS (<style>): Contiene todas las reglas de estilo. Utiliza variables CSS (:root) para una fácil personalización del tema Art Deco y media queries para la responsividad.
3.  JavaScript (<script>): Alberga toda la lógica del juego, desde la gestión del estado hasta la interacción del usuario y las reglas del solitario.
## 3. Sección HTML
El cuerpo del HTML está organizado de la siguiente manera:
* **Controles Principales (div class="game-controls"):**
  * Contiene los botones de Nueva Partida, Deshacer, Pista, así como los marcadores de Tiempo y Puntos.
* **Tablero de Juego (div id="game-board"):**
  * **Área Superior (div class="top-area"):** Organiza el mazo de robo (stock), el mazo de descarte (waste) y las cuatro bases finales (foundation).
  * **Columnas del Tablero (div id="tableau-n"):** Siete columnas donde se desarrolla la mayor parte del juego.
* **Ventanas Modales (div class="modal-overlay"):**
  * **Menú de Inicio (#start-menu-overlay):** Permite al jugador elegir la dificultad antes de comenzar.
  * **Mensaje de Victoria (#win-message):** Muestra la puntuación final y el récord personal al ganar.
  * **Ventana de Pista (#hint-modal):** Muestra la sugerencia proporcionada por la IA.
  * **Indicador de Carga (#loader):** Aparece mientras se espera la respuesta de la IA.
* **Pie de Página (<footer>):**
  * Muestra la leyenda "Designed by SPHERE" como una marca de agua.
## 4. Sección CSS
El estilo del juego se define con varias técnicas modernas de CSS:
* **Variables CSS (:root):**
  * Se definen los colores principales del tema Art Deco (--color-gold, --color-dark-green, etc.) y las dimensiones clave (--card-width, --gap), permitiendo cambios globales de diseño de forma sencilla.
* **Layout con Grid y Flexbox:**
  * display: grid se utiliza en #game-board para crear la estructura de 7 columnas del solitario.
  * display: flex se usa en .game-controls y otras áreas para alinear los elementos de manera flexible.
* **Estilo de las Cartas:**
  * El efecto de volteo de las cartas se logra con transform-style: preserve-3d y backface-visibility: hidden.
  * Las clases .card.face-up controlan la rotación (transform: rotateY(180deg)).
  * El arrastre se resalta con la clase .dragging, que aumenta el z-index y añade una sombra para dar una sensación de elevación.
* **Animaciones:**
  * Se utiliza @keyframes para la animación bounce-in (cuando una carta llega a una base) y spin (para el ícono de carga).
* **Diseño Responsivo:**
  * Se utilizan clamp() para el tamaño de fuente de los iconos, permitiendo que escalen fluidamente con el tamaño de la pantalla.
  * Las @media queries ajustan las variables de CSS (--card-width, --gap, etc.) en puntos de ruptura específicos (900px y 600px) para optimizar la vista en tabletas y móviles.
## 5. Sección JavaScript
Esta es la sección más compleja, ya que contiene el motor del juego.
**5.1. Variables Globales y Estado del Juego**
La lógica del juego se gestiona a través de un conjunto de variables globales que representan el estado actual de la partida.
let stock = [], waste = [], foundations = [[], [], [], []], tableau = [[], [], [], [], [], [], []];
let moveHistory = []; // Almacena estados previos para la función de deshacer.
let timerInterval, seconds = 0;
let score = 0, highScore = 0;
let drawCount = 1; // 1 para fácil, 3 para realista.
let dragState = {}; // Objeto que gestiona el estado de una carta mientras es arrastrada.

###**5.2. Flujo de Inicialización**
DOMContentLoaded: El script se ejecuta cuando el HTML ha sido cargado.
initGame(): Función principal que se llama al inicio. Restablece el tablero, el tiempo y la puntuación, y muestra el menú de inicio (#start-menu-overlay).
Selección de Dificultad: El usuario elige entre "Fácil" o "Realista".
startGame(drawCount): Esta función se ejecuta después de elegir la dificultad.
Establece la variable drawCount.
Llama a createDeck(), shuffleDeck() y dealCards() para preparar las cartas.
Inicia el temporizador con startTimer().
Renderiza el estado inicial del tablero con renderAllPiles().
5.3. Lógica Principal del Juego
Renderizado del Tablero
El estado del juego (almacenado en los arrays) se traduce en elementos HTML a través de las funciones render.
renderAllPiles(): Orquesta el renderizado de todas las secciones del tablero.
createCardElement(card): Crea el <div> de una carta con su estructura interna (anverso, reverso), clases CSS y event listeners.
Funciones específicas como renderTableau(), renderStock(), etc., se encargan de limpiar y volver a dibujar cada sección del tablero según el estado actual de los arrays.
Interacción del Usuario (Arrastrar y Soltar)
La mecánica de arrastrar y soltar es compatible con ratón y pantallas táctiles.
onDragStart(e): Se activa con mousedown o touchstart.
Identifica qué carta (o grupo de cartas) se está moviendo.
Puebla el objeto dragState con la información necesaria (cartas arrastradas, pila de origen, posición inicial del cursor).
Añade los event listeners para mousemove/touchmove y mouseup/touchend.
onDragMove(e): Se activa mientras el usuario mueve el cursor o el dedo.
Actualiza la posición (left, top) de las cartas arrastradas para que sigan al puntero.
onDragEnd(e): Se activa cuando el usuario suelta la carta.
Identifica la posible pila de destino con getDropTarget().
Valida si el movimiento es legal usando isValidTableauMove() o isValidFoundationMove().
Si el movimiento es válido, llama a performMove().
Si no es válido, llama a renderAllPiles() para que las cartas vuelvan a su posición original.
Limpia los event listeners de movimiento.
5.4. Sistema de Puntuación
La lógica de puntuación está centralizada en la función performMove().
function performMove(targetType, targetIndex) {
    // ...
    let pointsEarned = 0;
    const sourceIsTableau = dragState.source.type === 'tableau';
    const sourceIsWaste = dragState.source.type === 'waste';
    const sourceIsFoundation = dragState.source.type === 'foundation';

    // Restricción: No se dan puntos si el movimiento se origina en una base.
    if (!sourceIsFoundation) {
        // Mover del descarte a una columna: +25 puntos
        if (sourceIsWaste && targetType === 'tableau') {
            pointsEarned = 25;
        }
        // Mover a una base final: +100 puntos
        else if (targetType === 'foundation') {
            pointsEarned = 100;
        }
        // Mover entre columnas: +20 puntos (solo si se revela una carta nueva)
        else if (sourceIsTableau && targetType === 'tableau') {
            if (/*...se revela una carta...*/) {
                pointsEarned = 20;
            }
        }
    }

    if (pointsEarned > 0) {
        updateScore(pointsEarned);
    }
    // ...
}


Otras reglas de puntuación:
Reciclar el mazo (drawFromStock): -100 puntos.
Deshacer movimiento (undoMove): -2 puntos.
5.5. Funcionalidades Adicionales
undoMove(): Recupera el último estado guardado en el array moveHistory y lo aplica al juego, restaurando las cartas y la puntuación (antes de la penalización de -2 puntos).
checkWinCondition(): Verifica si las 4 bases finales tienen 13 cartas cada una. Si es así, detiene el tiempo, actualiza el récord si es necesario y muestra la pantalla de victoria.
getHintFromLLM(): Prepara una descripción del estado actual del juego en texto, la envía a una API de IA (no visible en este código, se asume su existencia) y muestra la respuesta en una ventana modal.

