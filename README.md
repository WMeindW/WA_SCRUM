# WA_SCRUM

Masopust WA Scrum project.

## Obsah

- [Technologie](#technologie)
- [Struktura projektu](#struktura-projektu)
- [Požadavky](#požadavky)
- [Instalace](#instalace)
  - [Windows](#windows)
  - [Linux](#linux)
- [Instalace závislostí](#instalace-závislostí)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Spuštění aplikace](#spuštění-aplikace)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Autor](#autor)
- [Licence](#licence)

---

## Technologie

Tento projekt využívá následující technologie:

- **Backend**: Node.js, Express, MySQL, JWT autentizace, bcrypt pro hashování hesel
- **Frontend**: React, React Router, Axios
- **Databáze**: MySQL
- **Další**: PDF generace pomocí `pdfkit`, plánování úloh s `node-cron`, e-mailové notifikace přes `nodemailer`

---

## Struktura projektu

```
WA_SCRUM/
│
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   └── ...
│
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   ├── vite.config.js
│   └── ...
│
├── _diagrams/
│   └── ...
│
├── .gitignore
└── README.md
```

- `backend/`: Serverová část aplikace (Express, MySQL, JWT, bcrypt)
- `frontend/`: Klientská část aplikace (React, React Router, Axios)
- `_diagrams/`: Diagramy a dokumentace
- `.gitignore`: Seznam ignorovaných souborů
- `README.md`: Tento soubor s instrukcemi

---

## Požadavky

- **Node.js**: Verze 14 nebo novější
- **npm**: Verze 6 nebo novější
- **MySQL**: Instalovaná databáze

---

## Instalace

### Windows

1. **Klonování repozitáře**

   Otevřete příkazový řádek a spusťte:

   ```bash
   git clone https://github.com/WMeindW/WA_SCRUM.git
   cd WA_SCRUM
   ```

2. **Instalace závislostí (viz níže)**

3. **Nastavení databáze**
   
   - Vytvořte MySQL databázi.
   - Upravte `.env` soubor v `backend/` složce s přihlašovacími údaji.

4. **Spuštění aplikace (viz níže)**

---

### Linux

1. **Klonování repozitáře**

   ```bash
   git clone https://github.com/WMeindW/WA_SCRUM.git
   cd WA_SCRUM
   ```

2. **Instalace závislostí (viz níže)**

3. **Nastavení databáze**
   
   - Vytvořte MySQL databázi.
   - Upravte `.env` soubor v `backend/` složce s přihlašovacími údaji.

4. **Spuštění aplikace (viz níže)**

---

## Instalace závislostí

### Backend

Přejděte do složky `backend` a nainstalujte všechny závislosti:

```bash
cd backend
npm install

npm install <package_name> <package_name> <> . . .
```

## Použité knihovny a návody na instalaci:

| **Knihovna**        | **Verze** | **Dokumentace** |
|---------------------|-----------|-----------------|
| bcrypt              | ^5.1.1    | [Odkaz](https://www.npmjs.com/package/bcrypt) |
| body-parser         | ^1.20.3   | [Odkaz](https://www.npmjs.com/package/body-parser) |
| cookie-parser       | ^1.4.7    | [Odkaz](https://www.npmjs.com/package/cookie-parser) |
| cors                | ^2.8.5    | [Odkaz](https://www.npmjs.com/package/cors) |
| dotenv              | ^16.4.7   | [Odkaz](https://www.npmjs.com/package/dotenv) |
| express             | ^4.21.2   | [Odkaz](https://www.npmjs.com/package/express) |
| jsdom               | ^26.0.0   | [Odkaz](https://www.npmjs.com/package/jsdom) |
| jsonwebtoken        | ^9.0.2    | [Odkaz](https://www.npmjs.com/package/jsonwebtoken) |
| mysql2              | ^3.12.0   | [Odkaz](https://www.npmjs.com/package/mysql2) |
| node-cron           | ^3.0.3    | [Odkaz](https://www.npmjs.com/package/node-cron) |
| node-fetch          | ^3.3.2    | [Odkaz](https://www.npmjs.com/package/node-fetch) |
| nodemailer          | ^6.10.0   | [Odkaz](https://www.npmjs.com/package/nodemailer) |
| pdfkit              | ^0.16.0   | [Odkaz](https://www.npmjs.com/package/pdfkit) |

### Frontend

Přejděte do složky `frontend` a nainstalujte všechny závislosti:

```bash
cd frontend
npm install

npm install <package_name> <package_name> <> . . .
```

## Použité knihovny a návody na instalaci (Frontend):

| **Knihovna**              | **Verze** | **Dokumentace** |
|---------------------------|-----------|-----------------|
| @types/react-router-dom    | ^5.3.3    | [Odkaz](https://www.npmjs.com/package/@types/react-router-dom) |
| axios                     | ^1.7.9    | [Odkaz](https://www.npmjs.com/package/axios) |
| js-cookie                 | ^3.0.5    | [Odkaz](https://www.npmjs.com/package/js-cookie) |
| react                     | ^19.0.0   | [Odkaz](https://reactjs.org/) |
| react-dom                 | ^19.0.0   | [Odkaz](https://reactjs.org/) |
| react-router-dom          | ^7.2.0    | [Odkaz](https://www.npmjs.com/package/react-router-dom) |

---

## Vývojové závislosti:

| **Knihovna**                    | **Verze** | **Dokumentace** |
|----------------------------------|-----------|-----------------|
| @eslint/js                       | ^9.19.0   | [Odkaz](https://www.npmjs.com/package/@eslint/js) |
| @types/js-cookie                 | ^3.0.6    | [Odkaz](https://www.npmjs.com/package/@types/js-cookie) |
| @types/react                     | ^19.0.8   | [Odkaz](https://www.npmjs.com/package/@types/react) |
| @types/react-dom                 | ^19.0.3   | [Odkaz](https://www.npmjs.com/package/@types/react-dom) |
| @vitejs/plugin-react             | ^4.3.4    | [Odkaz](https://www.npmjs.com/package/@vitejs/plugin-react) |
| eslint                           | ^9.19.0   | [Odkaz](https://www.npmjs.com/package/eslint) |
| eslint-plugin-react-hooks        | ^5.0.0    | [Odkaz](https://www.npmjs.com/package/eslint-plugin-react-hooks) |
| eslint-plugin-react-refresh      | ^0.4.18   | [Odkaz](https://www.npmjs.com/package/eslint-plugin-react-refresh) |
| globals                          | ^15.14.0  | [Odkaz](https://www.npmjs.com/package/globals) |
| typescript                       | ~5.7.2    | [Odkaz](https://www.typescriptlang.org/) |
| typescript-eslint                | ^8.22.0   | [Odkaz](https://www.npmjs.com/package/typescript-eslint) |
| vite                             | ^6.1.0    | [Odkaz](https://www.npmjs.com/package/vite) |

---

## Spuštění aplikace

### Backend

1. Otevřete terminál a přejděte do složky `backend`:

   ```bash
   cd backend
   ```

2. Spusťte server:

   ```bash
   npm start
   ```

Backend bude běžet na `http://localhost:5000`.

---

### Frontend

1. Otevřete nový terminál a přejděte do složky `frontend`:

   ```bash
   cd frontend
   ```

2. Spusťte vývojový server:

   ```bash
   npm run dev
   ```

Frontend bude dostupný na `http://localhost:3000`.

---

## Autors

[Daniel Linda](https://github.com/WMeindW)

[Matěj Červenka](https://github.com/Matresis)

[Tadeáš Krása](https://github.com/tada170)

[Šimon Stopa](https://github.com/Burtik21)
