import axios from 'axios';

// Fetches the profile information of a specific user

export const getUserProfile = async (username, authToken) => {
  try {
    const response = await axios.get(
      `/api/user/${username}`,
      authToken && { headers: { authorization: authToken } }
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

// Follows or unfollows a user with a given id depending on

export const followUser = async (userId, authToken) => {
  try {
    const response = await axios.post(`/api/user/${userId}/follow`, null, {
      headers: { authorization: authToken },
    });
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

// Retrieves who the user is following

export const retrieveUserFollowing = async (userId, offset, authToken) => {
  try {
    const response = await axios.get(
      `/api/user/${userId}/${offset}/following`,
      {
        headers: { authorization: authToken },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

// Retrieves who is following the user

export const retrieveUserFollowers = async (userId, offset, authToken) => {
  try {
    const response = await axios.get(
      `/api/user/${userId}/${offset}/followers`,
      {
        headers: { authorization: authToken },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};
