# Proyecto TamagochiGood

Este proyecto es un juego basado en un tablero donde los jugadores pueden moverse, rotar y disparar. El sistema está dividido en dos partes principales: un cliente y un servidor, que se comunican en tiempo real mediante WebSockets.

## Objetivos Conseguidos

1. **Comunicación Cliente-Servidor vía WebSockets**  
   - El cliente se conecta al servidor usando Socket.IO.
   - Se envían y reciben mensajes en tiempo real permitiendo la sincronización del estado del juego entre todos los clientes.

2. **Representación Dinámica del Juego**  
   - El cliente actualiza y dibuja el tablero de manera dinámica según los datos enviados por el servidor, falataria hacer detalles para el tablero,etc.
   - Se muestran los jugadores con su dirección y visibilidad..

3. **Eventos del Juego**  
   - He implementado botones y eventos para disparar, mover y rotar el jugador:
     - Botón para desplazarse (`Mover Adelante`).
     - Botón para rotar (`Girar`).
     - Botón para disparar (`Disparar`).
   - Estos eventos hacen mensajes que se envian al servidor.

4. **Diseño de la Interfaz**  
   - La interfaz de usuario ha sido diseñada de forma modular, facilitando futuras adaptaciones o rediseños, se podria mejorar un poco mas icluso.

5. **Gestión de Salas y Control del Juego**  
   - El servidor maneja las salas para gestionar partidas y compartir el estado del juego entre todos los clientes.
   - Se controla como asigno yo los jugadores, el diseño del mapa y el estado global del juego.

6. **Uso de Buenas Prácticas y Patrones de Diseño**  
   - He estructurado el código en clases y módulos.
   - Utilizo objetos JSON para la comunicación y se aplican patrones de diseño para facilitar la escalabilidad del proyecto.


## Objetivos No Conseguidos o Pendientes

- **Eliminación de Jugadores al Disparar:**  
  - Aún existen aspectos en la lógica de disparo que requieren ajustes para asegurar que el jugador impactado se elimine o se oculte correctamente, ya que no he conseguido hacerlo me llega el mensaje y todo de que hace la accion de shoot pero para que desaparezca el player no lo consigo, no consigo pillar el id de ese player y hacer que no este en el juego y volver a cargar el board.

- **Adaptación Completa a Angular:**  
  - No he podido hacerlo.

- **Gestión Completa de Reconexiones:**  
  - La lógica para manejar desconexiones y reconexiones de jugadores sin afectar la partida no la he podido hacer.

## Rubrica

### Diseño del Tablero y Mecánicas de Juego
- **Tablero NxN:** No
- **Jugadores en las esquinas:** Sí
- **Ataques entre jugadores (reglas de distancia):** No
- **Casillas de escondite:** Sí

### Comunicación Cliente-Servidor con WebSockets
- **Servidor configurado vía WebSockets:** Sí
- **Envío y recepción eficiente de mensajes:** Sí
- **Sincronización en tiempo real:** Sí
- **Manejo de desconexiones/reconexiones sin afectar la partida:** No

### Implementación del Cliente y Eventos del Juego
- **Representación visual dinámica del tablero:** Sí
- **Implementación de eventos (movimiento, rotación, disparo):** Sí
- **Interfaz intuitiva:** Si
- **Adaptabilidad a rediseños/futuras mejoras:** No

### Gestión de Salas y Control del Juego
- **Implementación de salas para partidas independientes:** No
- **Control centralizado en el servidor:** No
- **Compartición eficiente del mapa entre clientes:** No
- **Manejo de finalización de partidas y asignación de ganadores:** Si

### Buenas Prácticas de Programación y Patrones de Diseño
- **Uso adecuado de clases, objetos JSON y patrones:** Sí
- **Código modular y bien estructurado:** Sí

### Adaptación a Angular
- **Refactorización del cliente a Angular (servicios y componentes):** No
- **Implementación de servicios y componentes en Angular para la gestión del juego:** No