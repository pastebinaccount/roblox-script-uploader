const express = require('express');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const SECRET_KEY = 'A89DE2D33D1DB48BE2E3568C1ED73';
const scriptsDir = path.join(__dirname, 'scripts');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(scriptsDir)) fs.mkdirSync(scriptsDir);

app.post('/upload', (req, res) => {
    const code = req.body.code;
    const id = uuidv4();
    const finalCode = `local accessKey = "${SECRET_KEY}"\n` + code;
    const filePath = path.join(scriptsDir, `${id}.txt`);
    fs.writeFileSync(filePath, finalCode);
    res.json({ link: `${req.protocol}://${req.get('host')}/raw/${id}` });
});

app.get('/raw/:id', (req, res) => {
    const filePath = path.join(scriptsDir, `${req.params.id}.txt`);
    if (fs.existsSync(filePath)) {
        res.type('text/plain').send(fs.readFileSync(filePath, 'utf8'));
    } else {
        res.status(404).send('Script not found');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));