const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId;
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const linkify = require('linkifyjs');
require('linkifyjs/plugins/mention')(linkify);
const fs = require('fs');

const socketHandler = require('../handlers/socketHandler');

// Retrieves a post's comments with a specified offset

module.exports.retrieveComments = async (postId, offset, exclude = 0) => {
  try {
    const commentsAggregation = await Comment.aggregate([
      {
        $facet: {
          comments: [
            { $match: { post: ObjectId(postId) } },
            // Sort the newest comments to the top
            { $sort: { date: -1 } },
            // Skip the comments we do not want
            // This will skip the duplicate comment if the comment has been made locally
            { $skip: Number(exclude) },
            { $sort: { date: 1 } },
            { $skip: Number(offset) },
            { $limit: 10 },
            {
              $lookup: {
                from: 'commentreplies',
                localField: '_id',
                foreignField: 'parentComment',
                as: 'commentReplies',
              },
            },
            {
              $lookup: {
                from: 'commentvotes',
                localField: '_id',
                foreignField: 'comment',
                as: 'commentVotes',
              },
            },
            { $unwind: '$commentVotes' },
            {
              $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'author',
              },
            },
            { $unwind: '$author' },
            {
              $addFields: {
                commentReplies: { $size: '$commentReplies' },
                commentVotes: '$commentVotes.votes',
              },
            },
            {
              $unset: [
                'author.password',
                'author.email',
                'author.private',
                'author.bio',
                'author.bookmarks',
              ],
            },
          ],
          commentCount: [
            {
              $match: { post: ObjectId(postId) },
            },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
      {
        $unwind: '$commentCount',
      },
      {
        $addFields: {
          commentCount: '$commentCount.count',
        },
      },
    ]);
    return commentsAggregation[0];
  } catch (err) {
    throw new Error(err);
  }
};

module.exports.sendEmail = async (to, subject, template) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  await transporter.sendMail({
    from: 'Panaroma Support" <support@panaroma.com>',
    to,
    subject,
    html: template,
  });
};


//Sends a confirmation email to an email address

module.exports.sendConfirmationEmail = async (
  username,
  email,
  confirmationToken
) => {
  if (process.env.NODE_ENV === 'production') {
    try {
      const source = fs.readFileSync(
        'templates/confirmationEmail.html',
        'utf8'
      );
      template = handlebars.compile(source);
      const html = template({
        username: username,
        confirmationUrl: `${process.env.HOME_URL}/confirm/${confirmationToken}`,
        url: process.env.HOME_URL,
      });
      await this.sendEmail(email, 'Confirm your panaroma account', html);
    } catch (err) {
      console.log(err);
    }
  }
};

// Formats a cloudinary thumbnail url with a specified size

module.exports.formatCloudinaryUrl = (url, size, thumb) => {
  const splitUrl = url.split('upload/');
  splitUrl[0] += `upload/${
    size.y && size.z ? `x_${size.x},y_${size.y},` : ''
  }w_${size.width},h_${size.height}${thumb && ',c_thumb'}/`;
  const formattedUrl = splitUrl[0] + splitUrl[1];
  return formattedUrl;
};

// Sends a notification when a user has commented on your post

module.exports.sendCommentNotification = async (
  req,
  sender,
  receiver,
  image,
  filter,
  message,
  postId
) => {
  try {
    if (String(sender._id) !== String(receiver)) {
      const notification = new Notification({
        sender: sender._id,
        receiver,
        notificationType: 'comment',
        date: Date.now(),
        notificationData: {
          postId,
          image,
          message,
          filter,
        },
      });
      await notification.save();
      socketHandler.sendNotification(req, {
        ...notification.toObject(),
        sender: {
          _id: sender._id,
          username: sender.username,
          avatar: sender.avatar,
        },
      });
    }
  } catch (err) {
    throw new Error(err.message);
  }
};

// Sends a notification to the user when the user is mentioned

module.exports.sendMentionNotification = (req, message, image, post, user) => {
  const mentionedUsers = new Set();
  linkify.find(message).forEach(async (item) => {
    if (
      item.type === 'mention' &&
      item.value !== `@${user.username}` &&
      item.value !== `@${post.author.username}` &&
      // Making sure a mentioned user only gets one notification regardless of how many times they are mentioned in one comment
      !mentionedUsers.has(item.value)
    ) {
      mentionedUsers.add(item.value);
      const receiverDocument = await User.findOne({
        username: item.value.split('@')[1],
      });
      if (receiverDocument) {
        const notification = new Notification({
          sender: user._id,
          receiver: receiverDocument._id,
          notificationType: 'mention',
          date: Date.now(),
          notificationData: {
            postId: post._id,
            image,
            message,
            filter: post.filter,
          },
        });
        await notification.save();
        socketHandler.sendNotification(req, {
          ...notification.toObject(),
          sender: {
            _id: user._id,
            username: user.username,
            author: user.author,
          },
        });
      }
    }
  });
};

// Generates a unique username based on the base username

module.exports.generateUniqueUsername = async (baseUsername) => {
  let uniqueUsername = undefined;
  try {
    while (!uniqueUsername) {
      const username = baseUsername + Math.floor(Math.random(1000) * 9999 + 1);
      const user = await User.findOne({ username });
      if (!user) {
        uniqueUsername = username;
      }
    }
    return uniqueUsername;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports.populatePostsPipeline = [
  {
    $lookup: {
      from: 'users',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    },
  },
  {
    $lookup: {
      from: 'comments',
      localField: '_id',
      foreignField: 'post',
      as: 'comments',
    },
  },
  {
    $lookup: {
      from: 'commentreplies',
      localField: 'comments._id',
      foreignField: 'parentComment',
      as: 'commentReplies',
    },
  },
  {
    $lookup: {
      from: 'postvotes',
      localField: '_id',
      foreignField: 'post',
      as: 'postVotes',
    },
  },
  {
    $unwind: '$postVotes',
  },
  {
    $unwind: '$author',
  },
  {
    $addFields: {
      comments: { $size: '$comments' },
      commentReplies: { $size: '$commentReplies' },
      postVotes: { $size: '$postVotes.votes' },
    },
  },
  {
    $addFields: { comments: { $add: ['$comments', '$commentReplies'] } },
  },
  {
    $unset: [
      'commentReplies',
      'author.private',
      'author.confirmed',
      'author.githubId',
      'author.bookmarks',
      'author.password',
    ],
  },
];
