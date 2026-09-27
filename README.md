# CUU Beauty Studio — www.cuubeauty.com

Sitio de citas de CUU Beauty Studio (Chihuahua). React + Vite en el frontend y un servidor Node
sin dependencias (`server.js`) que sirve el sitio y la API de citas.

## Cómo se publica

Cada `push` a `main` se despliega solo en Hostinger (Node 22): `npm install` → `npm run build` → `node server.js`.

## Dónde cambiar cosas

| Quiero cambiar…                              | Archivo                     |
| -------------------------------------------- | --------------------------- |
| Especialistas, servicios, duraciones, horarios, WhatsApp | `src/data/salon.json` |
| Textos de la página de inicio                | `src/pages/Home.jsx`        |
| Curso de manicura                            | `src/pages/Courses.jsx`     |
| Colores y estilos                            | `src/styles.css` (`:root`)  |
| Títulos para Google por página               | `server.js` → `routeMeta`   |

Los horarios van en formato 24 h por día de la semana (`"1"` = lunes … `"6"` = sábado; sin clave = cerrado).

Para bloquear un día completo (vacaciones, día libre) basta con crear un evento de **día completo**
en el Google Calendar de la especialista: la web deja de ofrecer horarios ese día.

## Cómo funciona una cita

1. `GET /api/availability` toma los horarios de `salon.json` y descuenta lo ocupado en el Google
   Calendar de la especialista (leído vía el webhook de n8n `cuu-beauty-disponibilidad`), considerando
   la duración del servicio y la hora actual de Chihuahua.
2. `POST /api/book` valida los datos, vuelve a revisar que el horario siga libre y manda la cita al
   webhook de n8n `book-appointment` (flujo **CUU Beauty agenda y whatsapp**), que crea el evento y envía
   las confirmaciones. Si algo falla, la clienta ve el error y un botón para agendar por WhatsApp.

## Fotos

Las originales están en `design/originales/`. Para regenerar las versiones WebP de `public/img/`:
`node scripts/optimize-images.mjs` (requiere `sharp`). `scripts/make-icons.mjs` genera íconos e imagen para redes.

## Desarrollo local

```bash
npm install
npm start        # API en http://localhost:3000 (sirve dist/)
npm run dev      # frontend con recarga en http://localhost:5173
```
