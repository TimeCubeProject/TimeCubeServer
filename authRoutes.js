const express = require('express');
const axios = require('axios');
const router = express.Router();
const config = require("./config.js");

require('dotenv').config();

const GOOGLE_CLIENT_ID = `${process.env.GOOGLE_API_ID}`;
const GOOGLE_CLIENT_SECRET = `${process.env.GOOGLE_API_SECRET}`;
const REDIRECT_URI = `<${config.server_address}/auth/google/callback>`;

// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});


router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post('<https://oauth2.googleapis.com/token>', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, id_token } = data;

    const { data: profile } = await axios.get('<https://www.googleapis.com/oauth2/v1/userinfo>', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

      
  } catch (error) {
    console.error('Error:', error.response.data.error);
    res.redirect('/login');
  }
});

router.get('/logout', (req, res) => {
  res.redirect('/login');
});
module.exports = router;

