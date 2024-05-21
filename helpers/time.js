
function isRecentAlert(alertDate) {
  const now = new Date();
  const alertTimestamp = new Date(alertDate);
  const diffInHours = (now - alertTimestamp) / (1000 * 60 * 60);
  console.log('diffInHours: ', diffInHours);
  return diffInHours <= 24;
}

module.exports = {
  isRecentAlert
}

