# Velmont Group SpA — Sitio web corporativo

Sitio one-page para Velmont Group SpA (licitaciones públicas y privadas en Chile), con formulario
de contacto que guarda los datos en PostgreSQL y notifica por correo vía SMTP.

## Estructura del proyecto

```
public/                    Frontend estático (servido directamente por Express)
  index.html
  robots.txt
  sitemap.xml
  assets/
    css/                    Fuente de los estilos (módulos, sin compilar)
    js/                     Fuente del JS (módulos ES, sin compilar)
    dist/                   Generado por `npm run build` (CSS/JS minificados) — no editar a mano
    images/
      logo/                 Logo del sitio
      icons/                Favicon e íconos
      (raíz)                Fotos generales del sitio

server/
  server.js                 Punto de entrada
  src/
    app.js                  Configuración de Express (middlewares, rutas)
    config/                 env, base de datos, SMTP
    middleware/              seguridad, CSRF, manejo de errores
    contact/                 dominio de contacto (routes → service → repository)
    migrations/               migraciones de base de datos

scripts/
  migrate.js                 Corre las migraciones (up/down)
  optimize-images.js         Genera versiones WebP responsivas de las fotos
  generate-icons.js          Genera favicon.ico, apple-touch-icon.png y og-image.jpg desde los SVG fuente

Dockerfile                   Build de la imagen de la app (multi-stage)
docker-compose.yaml          Stack de despliegue: app + postgres (Nginx nativo del VPS hace de proxy)
```

## Instalación

Requisitos: Node.js 18+, PostgreSQL 14+, una cuenta SMTP para `contacto@velmontgroup.cl`.

```bash
npm install
cp .env.example .env      # completar con credenciales reales (ver tabla abajo)
```

Crear la base de datos (una vez, en el servidor PostgreSQL):

```sql
CREATE DATABASE velmontgroup;
```

Ejecutar migraciones y build de producción:

```bash
npm run migrate            # crea la tabla contacts
npm run build               # minifica CSS/JS a public/assets/dist
npm start                    # levanta el servidor (por defecto puerto 3000)
```

`npm start` corre automáticamente `npm run build` antes de arrancar (script `prestart`).

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `production` en el VPS |
| `PORT` | Puerto interno del proceso Node (Nginx hace de proxy hacia él) |
| `APP_URL` | `https://velmontgroup.cl` |
| `DATABASE_URL` | Cadena de conexión PostgreSQL: `postgres://usuario:password@host:5432/velmontgroup` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Datos del servidor SMTP |
| `SMTP_USER`, `SMTP_PASS` | Credenciales de `contacto@velmontgroup.cl` |
| `SMTP_FROM` | Remitente que verán los destinatarios |
| `CONTACT_EMAIL_TO` | `velmontgroupspa@gmail.com` |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Límite de envíos del formulario por IP |

Nunca se sube `.env` al repositorio (ya está en `.gitignore`).

## Base de datos

Tabla `contacts` (creada por la migración en `server/src/migrations/`):

| Columna | Tipo | Notas |
|---|---|---|
| `id` | `serial primary key` | |
| `name` | `varchar(150)` | |
| `email` | `varchar(255)` | índice |
| `phone` | `varchar(30)` | |
| `locality` | `varchar(150)` | |
| `ip_address` | `varchar(45)` | |
| `user_agent` | `text` | |
| `created_at` | `timestamptz` | índice, default `now()` |

Los datos **no son públicos**: no hay panel de administración ni endpoint de lectura. Para revisarlos,
conéctate directamente a la base con `psql` o pgAdmin:

```sql
SELECT id, name, email, phone, locality, created_at FROM contacts ORDER BY created_at DESC;
```

Revertir la última migración: `npm run migrate:down`.

## Cómo actualizar imágenes y contenido

- **Logo**: reemplaza `public/assets/images/logo/logo.svg` por el logo real (se incluyó un
  placeholder de texto para que el sitio no se rompa mientras tanto). Si usas PNG, actualiza también
  la ruta `src` en `public/index.html` (bloque `<a class="brand">`).
- **Favicon**: coloca `favicon.ico` (32×32) en `public/` y un `favicon.svg` real en
  `public/assets/images/icons/` (ya hay un placeholder). Agrega también
  `apple-touch-icon.png` (180×180) en `public/assets/images/icons/`.
- **Imagen para redes sociales (Open Graph / Twitter)**: coloca `og-image.jpg` (1200×630) en
  `public/assets/images/logo/`.
- **Fotos generales**: colócalas directamente en `public/assets/images/` (formato JPG o PNG) y corre
  `npm run optimize:images` para generar automáticamente versiones WebP responsivas (480/768/1280/1920px).
  Luego referencia esas imágenes en `public/index.html` con `<img loading="lazy">`.
- **Textos**: todo el contenido (títulos, párrafos, tarjetas de servicios) vive directamente en
  `public/index.html` — es un solo archivo, fácil de editar sin tocar el backend.
- Después de cambiar CSS o JS, vuelve a correr `npm run build` para regenerar
  `public/assets/dist/style.css` y `public/assets/dist/main.js`.

## Seguridad implementada

- Cabeceras HTTP de seguridad y CSP restrictiva (`helmet`)
- Protección CSRF (patrón double-submit cookie, endpoint `GET /api/csrf-token`)
- Rate limiting en `POST /api/contact`
- Validación y sanitización en frontend y backend (nombre, correo, teléfono, localidad)
- Consultas SQL siempre parametrizadas (sin concatenación de strings)
- Credenciales solo en variables de entorno, nunca en el código

## SEO implementado

- Meta title, meta description, canonical
- Open Graph y Twitter Cards
- `robots.txt` y `sitemap.xml`
- Favicon (SVG + espacio para `.ico` y `apple-touch-icon`)

## Despliegue en el VPS de Hostinger (Docker Compose + Nginx nativo)

El VPS (`srv1795969.hstgr.cloud`, Ubuntu 22.04) ya aloja otro proyecto existente del mismo dueño
(`cubitx.site` y subdominios) servido por un **Nginx nativo del sistema** (no en Docker), que ocupa
los puertos 80 y 443. Por eso este sitio **no usa Caddy ni puertos 80/443 propios**: se despliega
como el proyecto Docker Compose `velmontgroup` con solo dos contenedores —

- `app` — la aplicación Node/Express (se construye con el `Dockerfile` del repo), publicada únicamente
  en `127.0.0.1:3010` del VPS (no accesible directo desde internet)
- `postgres` — PostgreSQL 16, con los datos en un volumen Docker persistente

El Nginx nativo ya existente recibe el tráfico público de `velmontgroup.cl` y lo reenvía a
`127.0.0.1:3010`, exactamente igual que hace con los demás sitios del VPS. El certificado SSL se
emite con `certbot --nginx`, el mismo mecanismo que usan los otros dominios en este servidor.

Archivos relevantes: `Dockerfile`, `docker-compose.yaml`, `.dockerignore`.

Pasos:

1. El proyecto debe estar en un repositorio Git (GitHub) accesible, para que la plataforma de
   Hostinger pueda clonarlo y construir la imagen.
2. Apuntar el DNS del dominio `velmontgroup.cl` (registro `A`/`ALIAS` en `@` y `www`) a la IP del VPS
   `177.7.33.4`, usando la API de DNS de Hostinger — sin tocar los registros de correo (MX, DKIM, SPF)
   ya configurados para `contacto@velmontgroup.cl`.
3. Desplegar el proyecto Docker Compose `velmontgroup` en el VPS, pasando las variables de entorno
   reales (las mismas de `.env`, incluyendo `POSTGRES_PASSWORD`) como configuración del proyecto —
   nunca se suben al repositorio.
4. Agregar un **nuevo** archivo de sitio en Nginx (`/etc/nginx/sites-available/velmontgroup`, symlink
   en `sites-enabled`) que haga `proxy_pass http://127.0.0.1:3010`, sin modificar ningún archivo de
   los sitios existentes (`cubitx-web`, `cubitx-support-web`, etc.).
5. Emitir el certificado: `certbot --nginx -d velmontgroup.cl -d www.velmontgroup.cl`.
6. Verificar que `https://velmontgroup.cl` responda correctamente y que los otros sitios del VPS
   sigan funcionando sin cambios.

`app.set('trust proxy', 1)` ya está configurado en `server/src/app.js` para que el rate limiting y el
registro de IP funcionen correctamente detrás de Nginx.

Para actualizar el sitio más adelante (nuevo commit en el repo): volver a desplegar el proyecto
Docker Compose para que reconstruya la imagen `app` con el código nuevo; `postgres` conserva sus
datos en el volumen sin verse afectado.
