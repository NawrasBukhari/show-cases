const express = require('express');
const request = require('request-promise-native');
const cheerio = require('cheerio');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Define your client URLs here
const targets = {
    "theme-1": "https://themenectar.com/salient/portfolio-layered/",
    "theme-2": "https://themenectar.com/salient/resort/"
};

// Serve injected CSS
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// Main webview proxy route
app.get('/preview/:client', async (req, res) => {
    const client = req.params.client;
    const targetUrl = targets[client];

    if (!targetUrl) {
        return res.status(404).send('Client not found');
    }

    try {
        const html = await request.get({
            uri: targetUrl,
            headers: {
                'User-Agent': 'Mozilla/5.0 (YourCustomProxy)'
            }
        });

        const $ = cheerio.load(html);

        // Inject your custom CSS file
        $('head').append(`<link rel="stylesheet" href="/styles/custom.css">`);

        res.send($.html());
    } catch (err) {
        console.error('Proxy error:', err.message);
        res.status(500).send('Failed to load preview');
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h2>Masked WebView Proxy</h2>
        <ul>
            <li><a href="/preview/theme-1">/preview/theme-1</a></li>
            <li><a href="/preview/theme-2">/preview/theme-2</a></li>
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`WebView proxy running on http://localhost:${PORT}`);
});
