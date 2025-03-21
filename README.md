# WA_SCRUM

Masopust wa scrum project.

## Obsah

- [Technologie](#technologie)
- [Struktura projektu](#struktura-projektu)
- [Požadavky](#požadavky)
- [Instalace](#instalace)
  - [Windows](#windows)
  - [Linux](#linux)
- [Spuštění aplikace](#spuštění-aplikace)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Autor](#autor)
- [Licence](#licence)

## Technologie

Tento projekt využívá následující technologie:

- **Backend**: Node.js, Express
- **Frontend**: React
- **Databáze**: SQLite

## Struktura projektu

```
WA_SCRUM/
│
├── backend/
│   ├── package.json
│   ├── server.js
│   └── ...
│
├── frontend/
│   ├── package.json
│   ├── public/
│   ├── src/
│   └── ...
│
├── _diagrams/
│   └── ...
│
├── .env
├── .gitignore
└── README.md
```

- `backend/`: Obsahuje serverovou část aplikace.
- `frontend/`: Obsahuje klientskou část aplikace.
- `_diagrams/`: Obsahuje diagramy a další dokumentaci.
- `.env`: Konfigurační soubor pro prostředí.
- `.gitignore`: Soubor specifikující, které soubory/git ignorovat.
- `README.md`: Tento soubor s instrukcemi.

## Požadavky

- **Node.js**: Verze 14 nebo novější
- **npm**: Verze 6 nebo novější

## Instalace

### Windows

1. **Klonování repozitáře**

   Otevřete příkazový řádek a spusťte:

   ```bash
   git clone https://github.com/WMeindW/WA_SCRUM.git
   cd WA_SCRUM
   ```

2. **Instalace závislostí pro backend**

   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Instalace závislostí pro frontend**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Linux

1. **Klonování repozitáře**

   Otevřete terminál a spusťte:

   ```bash
   git clone https://github.com/WMeindW/WA_SCRUM.git
   cd WA_SCRUM
   ```

2. **Instalace závislostí pro backend**

   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Instalace závislostí pro frontend**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Spuštění aplikace

### Backend

1. **Spuštění serveru**

   ```bash
   cd backend
   npm start
   ```

   Server by měl běžet na adrese `http://localhost:5000`.

### Frontend

1. **Spuštění aplikace**

   ```bash
   cd frontend
   npm start
   ```

   Aplikace by měla být dostupná na adrese `http://localhost:3000`.

## Autor

WMeindW

## Licence

Tento projekt je licencován pod MIT licencí. 
