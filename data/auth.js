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
  const formData = new FormData();
  for (const key in user) {
    if (user[key] != null) {
      formData.append(key, user[key]);
    }
  }

  return fetchWithResponse('register', {
    method: 'POST',
    body: formData, 
  })
  .catch((err) => {
    console.error('Register failed:', err);
    return { token: null, error: err.message }; 
  });
}

export const createUserBusiness = async (formData, token) => {
  try {
    const data = await fetchWithResponse('userbusiness', {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData, 
    });
    return data;
  } catch (err) {
    console.error("Failed to create user business:", err);
    throw err;
  }
};



export const getMediums = () => {
  return fetchWithResponse('medium',{
    method:"GET",
    headers:{
      Authorization: `Token ${localStorage.getItem('token')}`,
    }
  })
}


export const getUserProfile = () => {
  return fetchWithResponse('businessprofile', {
    method:"GET",
    headers:{
      Authorization: `Token ${localStorage.getItem('token')}`
    }
  })
}