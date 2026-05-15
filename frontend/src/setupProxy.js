const { createProxyMiddleware } = require('http-proxy-middleware');

// Dev server runs in Docker as "frontend"; use backend hostname there.
const target =
  process.env.REACT_APP_PROXY_TARGET ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000';

module.exports = function (app) {
  // Only /api — do not proxy /static (CRA serves /static/js/bundle.js from webpack).
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
