const express = require('express');

const PORT =  80;

const app = express();

app.get('/', (req, res) => {
    res.send({'code':200});
});

app.listen(PORT);
