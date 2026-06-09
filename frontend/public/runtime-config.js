// Optional runtime override — Coolify injects REACT_APP_API_URL via docker-entrypoint.
(function () {
  window.REACT_APP_API_URL = window.REACT_APP_API_URL || '';
})();
