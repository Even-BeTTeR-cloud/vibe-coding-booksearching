const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');
const path = require('path');

const app = express();
const PORT = 3000;

// Naver API Credentials
const CLIENT_ID = 'kWBIdFAOZWP9Q_qLFN8Y';
const CLIENT_SECRET = 'A5d1WdTrK0';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
        const response = await axios.get('https://openapi.naver.com/v1/search/book.xml', {
            params: {
                query: query,
                display: 12,
                start: 1
            },
            headers: {
                'X-Naver-Client-Id': CLIENT_ID.trim(),
                'X-Naver-Client-Secret': CLIENT_SECRET.trim()
            }
        });

        const parser = new xml2js.Parser({ explicitArray: false });
        parser.parseString(response.data, (err, result) => {
            if (err) {
                console.error('XML Parse Error:', err);
                return res.status(500).json({ error: 'Failed to parse XML' });
            }
            const books = result?.rss?.channel?.item || [];
            res.json(Array.isArray(books) ? books : [books]);
        });

    } catch (error) {
        console.error('Naver API Request Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }
        res.status(error.response?.status || 500).json({ 
            error: 'Naver API Authentication Failed or other error',
            details: error.response?.data
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
