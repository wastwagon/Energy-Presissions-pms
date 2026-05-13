// Runtime configuration for API URL
// Optional include before the app — mirrors index.html production fallback.
(function () {
  var h = window.location.hostname;
  if (h === 'energyprecisions.com' || h === 'www.energyprecisions.com') {
    window.REACT_APP_API_URL =
      window.REACT_APP_API_URL || 'https://energy-pms-backend-1b7h.onrender.com';
  }
})();








