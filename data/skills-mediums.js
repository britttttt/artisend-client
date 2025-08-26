import { fetchWithResponse } from "./fetcher"

export const getBusinessSkills = (token) => {
  return fetchWithResponse('userskill', {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    }
  });
};

export const getBusinessMediums = (token) => {
  return fetchWithResponse('usermedium', {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    }
  });
};


export const getBusinessSkillsByUserId = (userId, token) => {
  return fetchWithResponse(`userskill?user=${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    }
  });
};

export const getBusinessMediumsByUserId = (userId, token) => {
  return fetchWithResponse(`usermedium?user=${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Token ${token}`,
    }
  });
};