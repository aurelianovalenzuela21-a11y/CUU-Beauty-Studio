# CUU Beauty Studio — cuubeauty.com

Sitio de CUU Beauty Studio (Chihuahua): servicios, equipo, reservas en línea y cursos.

- **Frontend:** React + Vite (`src/`). Rutas: `/`, `/cursos`, `/equipo/:id`.
- **Backend:** Express (`server.js`) sirve `dist/` y expone:
  - `GET /get-availability?date=YYYY-MM-DD&staffId=ailyn` → horarios ocupados (vía n8n).
  - `POST /create-event` → valida y reserva vía n8n, que revisa el calendario, crea el evento y manda WhatsApp/correos.
- **n8n:** flujos "CUU Beauty disponibilidad (web)" y "CUU Beauty reservar (web)". Usan la conexión "Google Calendar account" de n8n; el servidor no guarda llaves de Google.
- **Datos compartidos:** `shared/studio.json` (especialistas, servicios, duraciones y horarios). Edita aquí para cambiar horarios o servicios; lo usan el frontend y el servidor.

## Desarrollo

```bash
npm install
npm run build && npm start   # http://localhost:3000
npm run lint
```

## Despliegue

Hostinger despliega automáticamente cada push a `main` (`npm install` → `npm run build` → `node server.js`).
`dist/` no se versiona: se genera en el servidor.

Variables de entorno necesarias en Hostinger: ver `.env.example`.
