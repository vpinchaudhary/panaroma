import axios from 'axios';

// Retrieves posts from user's feed

export const retrieveFeedPosts = async (authToken, offset = 0) => {
  try {
    const response = await axios.get(`/api/post/feed/${offset}`, {
      headers: {
        authorization: authToken,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data);
  }
};
