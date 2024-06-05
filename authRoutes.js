// Importowanie modułów
const express = require('express'); // Moduł Express do tworzenia serwera webowego
const axios = require('axios'); // Moduł Axios do wykonywania zapytań HTTP
const router = express.Router(); // Tworzenie routera Express
const config = require("./config.js"); // Plik konfiguracyjny

// Importowanie zmiennych środowiskowych z pliku .env
require('dotenv').config();

// Pobieranie danych logowania do Google API z pliku .env
const GOOGLE_CLIENT_ID = `${process.env.GOOGLE_API_ID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.GOOGLE_API_SECRET}`;
const REDIRECT_URI = `<${config.server_address}/auth/google/callback>`;


// Endpoint do rozpoczęcia procesu autoryzacji przez Google
router.get('/auth/google', (req, res) => {
    // URL do autoryzacji Google OAuth 2.0
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
    res.redirect(url);
});

// Endpoint do obsługi przekierowania po autoryzacji przez Google
router.get('/auth/google/callback', async (req, res) => {
    const {
        code
    } = req.query; // Pobranie kodu autoryzacji z zapytania

    try {
         // Wysłanie żądania POST do Google OAuth 2.0 w celu wymiany kodu autoryzacji na tokeny
        const {
            data
        } = await axios.post('<https://oauth2.googleapis.com/token>', {
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code',
        });

        const {
            access_token,
            id_token
        } = data;

        // Wysłanie żądania GET do Google API w celu pobrania informacji o użytkowniku
        const {
            data: profile
        } = await axios.get('<https://www.googleapis.com/oauth2/v1/userinfo>', {
            headers: {
                Authorization: `Bearer ${access_token}`
            },
        });


    } catch (error) {
        console.error('Error:', error.response.data.error);
        res.redirect('/login'); // Przekierowanie użytkownika na stronę logowania
    }
});

// Endpoint do wylogowania użytkownika
router.get('/logout', (req, res) => {
    res.redirect('/login'); // Przekierowanie użytkownika na stronę logowania
});

// Eksportowanie routera
module.exports = router;
