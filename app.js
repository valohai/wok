const debug = require('debug')('wok:app');
const Handler = require('./lib/handler');
const getExpressApp = require('./lib/get-express-app');
const path = require('path');
const http = require('http');

const port = parseInt(process.env.WOK_PORT || '9400', 10);
const handler = new Handler((process.env.WOK_DIRS || './rules').split(path.delimiter));
const app = getExpressApp(handler);
app.set('port', port);
const server = http.createServer(app);
server.listen(port);
server.on('listening', () => {
  debug(`listening on ${JSON.stringify(server.address())}`);
});
