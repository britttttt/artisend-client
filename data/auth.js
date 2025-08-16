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

export const getCategories = () => {
  return fetchWithResponse('category', {  
    method: "GET",
    headers: {
      Authorization: `Token ${localStorage.getItem('token')}`,
    }
  });
};

export const createPost = (formData) => {
  return fetchWithResponse('posts', {
    method: "POST",
    headers: {
      Authorization: `Token ${localStorage.getItem('token')}`
    },
    body: formData
  });
};

export const getUserAccount = (token) => {
  return fetchWithResponse('user/me', {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    }
  });
};

export const updateUserAccount = (token, userData) => {
  const formData = new FormData();
  for (const key in userData) {
    if (userData[key] != null) {
      formData.append(key, userData[key]);
    }
  }

  return fetchWithResponse('user/1', {  // Use the user's ID, or just 'user/me' if your backend supports it
    method: 'PATCH',
    headers: {
      Authorization: `Token ${token}`,
    },
    body: formData,
  });
};

export const getBusinessProfileByUserId = (userId, token) => {
  return fetchWithResponse(`businessprofile?user=${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    }
  });
};