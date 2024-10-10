// TODO: not used

const cleanCookieString = (cookieString) => {
  // Ersetze die falsch escape-Zeichen durch normale Anführungszeichen
  return cookieString.replace(/\\054/g, '"');
};

const getCookie = (name) => {
  const value = `; ${document.cookie};`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";")[0].trim();
  }
  return null;
};

// Cookie abrufen
const cookie = getCookie("oidc_session");

if (cookie) {
  // Cookie-String bereinigen
  const cleanedCookie = cleanCookieString(cookie);

  try {
    // Bereinigten Cookie-String in ein Objekt umwandeln
    const cookieObj = JSON.parse(cleanedCookie);

    if (cookieObj && cookieObj.oidc_session_info) {
      // sessionData aktualisieren
      const sessionData = {
        cookie: cleanedCookie,
        oidc_session_info: {
          oidc_auth_token: cookieObj.oidc_auth_token || null,
          sub: cookieObj.oidc_session_info.sub || null,
          email_verified: cookieObj.oidc_session_info.email_verified || null,
          roles: cookieObj.oidc_session_info.roles || null,
          name: cookieObj.oidc_session_info.name || null,
          groups: cookieObj.oidc_session_info.groups || null,
          preferred_username:
            cookieObj.oidc_session_info.preferred_username || null,
          given_name: cookieObj.oidc_session_info.given_name || null,
          family_name: cookieObj.oidc_session_info.family_name || null,
          email: cookieObj.oidc_session_info.email || null,
        },
      };

      console.log("sessionData: ", sessionData);
    } else {
      console.error("Cookie enthält keine oidc_session_info.");
    }
  } catch (error) {
    console.error("Fehler beim Parsen des Cookies: ", error);
  }
} else {
  console.error("Cookie nicht gefunden.");
}
