const express = require('express');
const path = require('path');
const app = express();

const VERSION = process.env.APP_VERSION || 'v1';
const PORT = process.env.PORT || 3000;

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => res.json({ status: 'ok', version: VERSION }));

app.get('/', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Jenkins K8s CI/CD Demo</title>
        <link rel="stylesheet" href="/static/style.css" />
      </head>
      <body>
        <main>
          <h1>Jenkins → Docker → Kubernetes</h1>
          <p>Deployed version: <strong>${VERSION}</strong></p>
          <p>If you see this page, your pipeline works 🎉</p>
          <a href="/static/index.html">Static page</a>
        </main>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT} (${VERSION})`);
});
