import axios from 'axios';

// Fetches a complete post with comments and the fully sized image instead of a thumbnail image

export const getPost = async (postId) => {
  try {
    const response = await axios.get(`/api/post/${postId}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

//gets users post when scrolled down so it takes offset

export const getPosts = async (username, offset = 0) => {
  try {
    const response = await axios.get(`/api/user/${username}/posts/${offset}`);
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};


// Either likes or dislikes a post

export const votePost = async (postId, authToken) => {
  try {
    await axios.post(`/api/post/${postId}/vote`, null, {
      headers: { authorization: authToken },
    });
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Sends an image and a caption as multipart/form-data and creates a post

export const createPost = async (formData, authToken) => {
  try {
    const post = await axios.post('/api/post', formData, {
      headers: {
        authorization: authToken,
        'Content-Type': 'multipart/form-data',
      },
    });
    return post.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Deletes a post

export const deletePost = async (postId, authToken) => {
  try {
    await axios.delete(`/api/post/${postId}`, {
      headers: {
        authorization: authToken,
      },
    });
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Toggles bookmarking a post

export const bookmarkPost = async (postId, authToken) => {
  try {
    const response = await axios.post(`/api/user/${postId}/bookmark`, null, {
      headers: { authorization: authToken },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Retrieves all filters

export const getPostFilters = async () => {
  try {
    const response = await axios.get('/api/post/filters');
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};

// Gets suggested posts

export const getSuggestedPosts = async (authToken, offset = 0) => {
  try {
    const response = await axios.get('/api/post/suggested/' + offset, {
      headers: {
        authorization: authToken,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};


// Gets posts associated with a specific hashtag

export const getHashtagPosts = async (authToken, hashtag, offset = 0) => {
  try {
    const response = await axios.get(`/api/post/hashtag/${hashtag}/${offset}`, {
      headers: {
        authorization: authToken,
      },
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response.data.error);
  }
};
