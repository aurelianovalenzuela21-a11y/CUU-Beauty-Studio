const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
// In most hosting dashboards env vars can't contain real newlines, so the key is stored
// with literal "\n" sequences and converted back here.
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const CALENDARS = {
    'Ailyn': '2a1a8b53eb4e0896c7e717689677d776fc03e9559b2406c81e34689d4e3e9fdf@group.calendar.google.com',
    'Arely': '1468b98a1bf3fe6cb42b42724d855262a389cd402811bb15a7d2abbc77fd2ffd@group.calendar.google.com',
    'Jazmine': 'aa433317bf9b7f844e6e09a2b45369d3e63f66f91832d06894f6a228dcaecffc@group.calendar.google.com',
    'Bere': 'af5ab4ac8f7c0cb8a18dedda14cbaa3261247bde24733aba37d2dda6486345ce@group.calendar.google.com'
};

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

app.use(express.json());

async function getGoogleAccessToken() {
    if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Missing GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY environment variables');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: GOOGLE_CLIENT_EMAIL,
        scope: 'https://www.googleapis.com/auth/calendar',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now
    };

    const token = jwt.sign(payload, GOOGLE_PRIVATE_KEY, { algorithm: 'RS256' });

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    }).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return tokenResponse.data.access_token;
}

app.post('/create-event', async (req, res) => {
    const { date, time, staffName, customerName, customerPhone, serviceName, customerEmail } = req.body;

    if (!date || !time || !staffName) {
        return res.status(400).json({error: "Missing required fields"});
    }

    const calendar_id = CALENDARS[staffName];
    if (!calendar_id) {
        return res.status(400).json({error: "Invalid staff name"});
    }

    try {
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) {
            return res.status(500).json({error: "No access token"});
        }

        const startDate = new Date(`${date.split('T')[0]}T${time}:00`);
        const endDate = new Date(startDate.getTime() + 60*60*1000); // 1 hour later

        const eventUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events`;

        const eventBody = {
            summary: `${customerName} - ${serviceName}`,
            description: `Cliente: ${customerName}\nTeléfono: ${customerPhone}\nEmail: ${customerEmail}\nServicio: ${serviceName}`,
            start: {
                dateTime: startDate.toISOString(),
                timeZone: 'America/Chihuahua'
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: 'America/Chihuahua'
            }
        };

        const eventResponse = await axios.post(eventUrl, eventBody, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({success: true, event: eventResponse.data});
    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({error: error.message});
    }
});

app.get('/get-availability', async (req, res) => {
    const { date, staffName } = req.query;

    if (!date || !staffName) {
        return res.json([]);
    }

    const calendar_id = CALENDARS[staffName];
    if (!calendar_id) {
        return res.json([]);
    }

    try {
        const accessToken = await getGoogleAccessToken();
        if (!accessToken) {
            return res.json([]);
        }

        const timeMin = new Date(date);
        timeMin.setUTCHours(0, 0, 0, 0);
        const timeMax = new Date(date);
        timeMax.setUTCHours(23, 59, 59, 999);

        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar_id)}/events?timeMin=${encodeURIComponent(timeMin.toISOString())}&timeMax=${encodeURIComponent(timeMax.toISOString())}&singleEvents=true`;

        const eventsResponse = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const eventsData = eventsResponse.data;
        console.log(`Events for ${calendar_id} on ${timeMin}:`, eventsData.items);

        const formatted_events = [];
        if (eventsData.items) {
            eventsData.items.forEach(item => {
                if (item.start && item.start.dateTime && item.end && item.end.dateTime) {
                    formatted_events.push({
                        start: { dateTime: item.start.dateTime },
                        end: { dateTime: item.end.dateTime }
                    });
                }
            });
        }

        res.json(formatted_events);
    } catch (error) {
        console.error('API Error:', error.response ? error.response.data : error.message);
        res.json([]);
    }
});

// For any other route, serve index.html (React router support)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
