import { fetchWithResponse } from "./fetcher"

export function login(user) {
  return fetchWithResponse('login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
}

export function register(user) {
  const formData = new FormData()

  for (const key in user) {
    if (user[key] != null) {
      formData.append(key, user[key])
    }
  }

  return fetchWithResponse('register', {
    method: 'POST',
    body: formData, 
  })
}
export function registerBusiness(user) {
  const formData = new FormData()

  for (const key in user) {
    if (user[key] != null) {
      formData.append(key, user[key])
    }
  }

  return fetchWithResponse('register', {
    method: 'POST',
    body: formData, 
  })
}

export function getUserProfile() {
  return fetchWithResponse('profile', {
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem('token')}`,
    }
  })
}
