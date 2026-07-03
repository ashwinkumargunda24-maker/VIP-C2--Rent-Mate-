const isValidGoogleMapsLink = (url) => {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      (parsed.hostname.includes("google.com") ||
        parsed.hostname.includes("goo.gl") ||
        parsed.hostname.includes("maps.app"))
    );
  } catch {
    return false;
  }
};

module.exports = { isValidGoogleMapsLink };
