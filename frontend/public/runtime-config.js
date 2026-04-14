// Runtime configuration for API URL
// Optional include before the app — mirrors index.html production fallback.
(function () {
  var h = window.location.hostname;
  var fallback = 'http://localhost:8000';
  if (h === 'energyprecisions.com' || h === 'www.energyprecisions.com') {
    fallback = 'https://energy-pms-backend-1b7h.onrender.com';
  }
  window.REACT_APP_API_URL = window.REACT_APP_API_URL || fallback;
})();








