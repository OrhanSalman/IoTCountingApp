export const getSessionStorage = (key) => {
  const data = sessionStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeSessionStorage = (key) => {
  sessionStorage.removeItem(key);
};

// TODO: unused or not working, one of the two
