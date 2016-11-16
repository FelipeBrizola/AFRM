
    port        = process.env.PORT || 8000, // eslint-disable-line
    directory   = '.',
    express     = require('express'),
    serveStatic = require('serve-static'),
    app         = express();

app.use(serveStatic(directory, {'index': [ 'index.html' ]}));
app.listen(port);

console.log("afrm server on port " + port); // eslint-disable-line
exports = module.exports = app;                            // eslint-disable-line

