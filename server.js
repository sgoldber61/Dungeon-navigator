var express = require('express');
var path = require('path');
var app = express();

app.use('/', express.static(`${__dirname}/client/build`));

// express will serve up index.html if it doesn't recognize the route
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
