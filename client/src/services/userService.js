import axios from 'axios';

// Searches for a username that is similar to the one supplied

export const searchUsers = async (username, offset = 0) => {
  try {
    const response = await axios.get(`/api/user/${username}/${offset}/search`);
    return response.data;
  } catch (err) {
    console.warn(err);
  }
};

// Verifies a user's email

export const confirmUser = async (authToken, confirmationToken) => {
  try {
    await axios.put(
      '/api/user/confirm',
      {
        token: confirmationToken,
      },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
  } catch (err) {
    throw new Error(err);
  }
};

// Uploads and changes a user's avatar

export const changeAvatar = async (image, authToken) => {
  const formData = new FormData();
  formData.append('image', image);
  try {
    const response = await axios.put('/api/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        authorization: authToken,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Removes a user's current avatar

export const removeAvatar = async (authToken) => {
  try {
    axios.delete('/api/user/avatar', {
      headers: {
        authorization: authToken,
      },
    });
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Updates the specified fields on the user

export const updateProfile = async (authToken, updates) => {
  try {
    const response = await axios.put(
      '/api/user',
      {
        ...updates,
      },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Gets random suggested users for the user to follow

export const getSuggestedUsers = async (authToken, max) => {
  try {
    const response = await axios.get(`/api/user/suggested/${max || ''}`, {
      headers: {
        authorization: authToken,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};
