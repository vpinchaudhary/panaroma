import axios from 'axios';

// Logs a user in with the provided credentials

export const login = async (usernameOrEmail, password, authToken) => {
  try {
    const request =
      usernameOrEmail && password
        ? { data: { usernameOrEmail, password } }
        : { headers: { authorization: authToken } };
    const response = await axios('/api/auth/login', {
      method: 'POST',
      ...request,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Logs the user in or signs them up with their github account

export const githubAuthentication = async (code) => {
  try {
    const response = await axios.post('/api/auth/login/github', {
      code,
      state: sessionStorage.getItem('authState'),
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Registers a user with the provided credentials

export const registerUser = async (email, fullName, username, password) => {
  try {
    const response = await axios.post('/api/auth/register', {
      email,
      fullName,
      username,
      password,
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Changes a users password

export const changePassword = async (oldPassword, newPassword, authToken) => {
  try {
    await axios.put(
      '/api/auth/password',
      {
        oldPassword,
        newPassword,
      },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};
