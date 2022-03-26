import axios from 'axios';

// Creates a comment on a specific post

export const createComment = async (message, postId, authToken) => {
  try {
    const response = await axios.post(
      `/api/comment/${postId}`,
      { message },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

// Deletes a comment with a specified comment id provided it was created by the user

export const deleteComment = async (commentId, authToken) => {
  try {
    await axios.delete(`/api/comment/${commentId}`, {
      headers: {
        authorization: authToken,
      },
    });
  } catch (err) {
    throw new Error(err);
  }
};

// Votes on a comment

export const voteComment = async (commentId, authToken) => {
  try {
    await axios.post(`/api/comment/${commentId}/vote`, null, {
      headers: { authorization: authToken },
    });
  } catch (err) {
    throw new Error(err);
  }
};

// Creates a reply to a specific comment

export const createCommentReply = async (
  message,
  parentCommentId,
  authToken
) => {
  try {
    const response = await axios.post(
      `/api/comment/${parentCommentId}/reply`,
      { message },
      {
        headers: {
          authorization: authToken,
        },
      }
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

// Deletes a comment reply with a specified comment reply id provided it was created by the 

export const deleteCommentReply = async (commentReplyId, authToken) => {
  try {
    await axios.delete(`/api/comment/${commentReplyId}/reply`, {
      headers: {
        authorization: authToken,
      },
    });
  } catch (err) {
    throw new Error(err);
  }
};

// Votes on a comment reply

export const voteCommentReply = async (commentReplyId, authToken) => {
  try {
    await axios.post(`/api/comment/${commentReplyId}/replyVote`, null, {
      headers: { authorization: authToken },
    });
  } catch (err) {
    throw new Error(err);
  }
};

// Gets 3 new replies from a parent comment

export const getCommentReplies = async (parentCommentId, offset = 0) => {
  try {
    const response = await axios.get(
      `/api/comment/${parentCommentId}/${offset}/replies`
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};

// Retrieves comments from a post with the given offset

export const getComments = async (postId, offset, exclude = 0) => {
  try {
    const response = await axios.get(
      `/api/comment/${postId}/${offset}/${exclude}`
    );
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
};
