const API_URL = "http://localhost:8000";

const checkError = (res) => {
  if (!res.ok) {
    throw Error(res.status);
  }
  return res;
};

// const checkErrorJson = (res) => {
//   if (!res.ok) {
//     throw Error(res.status);
//   } else {
//     return res.json()
//   }
// }
const checkErrorJson = (res) => {
  const contentType = res.headers.get("content-type");
  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      return res.json().then((err) => {
        throw new Error(err.message || `HTTP ${res.status}`);
      });
    } else {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }
  } else {
    return contentType && contentType.includes("application/json")
      ? res.json()
      : res.text(); // fallback
  }
};

const catchError = (err) => {
  if (err.message === "401") {
    window.location.href = "/login";
  } else if (err.message === "404") {
    throw Error(err.message);
  } else {
    console.error("API Error:", err);
    throw err;
  }
};

export const fetchWithResponse = (resource, options) =>
  fetch(`${API_URL}/${resource.replace(/\/$/, "")}`, options)
    .then(checkErrorJson)
    .catch(catchError);

export const fetchWithoutResponse = (resource, options) =>
  fetch(`${API_URL}/${resource}`, options).then(checkError).catch(catchError);
