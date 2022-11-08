// a function that convert timestamp to above localtime format
export function convertTimestampToLocalTime(timestamp) {
  // 12:20 AM
  const time = new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  return time;
}
