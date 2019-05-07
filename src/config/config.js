require('dotenv/config');
// =================================
// Entorno
//==================================

process.env.NODE_ENV = process.env.NODE_ENV || process.env.NODE_DEV;

// =================================
// Puerto
//==================================
process.env.PORT = process.env.PORT || process.env.DEV_PORT;

// =================================
// Base de datos
//==================================

let urlDB;

if (process.env.NODE_ENV === process.env.NODE_DEV) {
    urlDB = process.env.MONGO_DEV;
} else {
    urlDB = process.env.MONGO_PRO;
}

process.env.URLDB = urlDB;

// =================================
// Vencimiento del Token
//==================================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias

process.env.CADUCIDAD_TOKEN = process.env.EXPIRATION_TOKEN;

// =================================
// SEED de autenticacion
//==================================

/* process.env.SEED_DEV = process.env.SEED_DEV; */
process.env.SEED = process.env.SEED || process.env.SEED_DEV;
// ======================
// DEFAULT PASS ADMIN
// ======================
process.env.PASS = process.env.PASS;