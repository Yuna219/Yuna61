const express = require('express');

const PORT = process.env.PORT || 3000;

const app = express();

app.get('/user', (req, res) => {
    res.send({'code':200});
});

app.listen(PORT);
