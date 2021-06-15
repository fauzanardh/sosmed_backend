import {User} from "../models/entity/User";
import {Post} from "../models/entity/Post";
import {Reply} from "../models/entity/Reply";
import {Notification} from "../models/entity/Notification";

export const parseUserSimple = (user: User) => {
    return {
        uuid: user.uuid,
        name: user.name,
        username: user.username,
        profilePictureDataId: user.profilePictureDataId
    }
}

export const parseFollow = (users: User[]) => {
    const returnVal = [];
    users.forEach((_follow: User) => {
        returnVal.push({
            id: _follow.uuid,
            name: _follow.name,
            username: _follow.username,
        });
    });
    return returnVal;
}

export const parseUsers = (users: User[]) => {
    const returnVal = [];
    users.forEach((user: User) => {
        returnVal.push({
            id: user.uuid,
            name: user.name,
            username: user.username,
            bio: user.bio,
            profilePictureDataId: user.profilePictureDataId,
            followers: parseFollow(user.followers),
            following: parseFollow(user.following),
        });
    });
    return returnVal;
}

export const parseLikedBy = (users: User[]) => {
    const returnVal = [];
    users.forEach((user: User) => {
        returnVal.push({
            id: user.uuid,
            name: user.name,
        });
    });
    return returnVal;
}

export const parseReplies = (replies: Reply[]) => {
    const returnVal = [];
    replies.forEach((reply: Reply) => {
        returnVal.push({
            id: reply.uuid,
            dataId: reply.dataId,
            author: parseUserSimple(reply.author),
            text: reply.text,
            likedBy: parseLikedBy(reply.likedBy),
            createdAt: reply.createdAt,
            updatedAt: reply.updatedAt,
        });
    });
    return returnVal;
}

export const parsePosts = (posts: Post[]) => {
    const returnVal = [];
    posts.forEach((post: Post) => {
        returnVal.push({
            id: post.uuid,
            author: parseUserSimple(post.author),
            dataId: post.dataId,
            text: post.text,
            likedBy: parseLikedBy(post.likedBy),
            replies: parseReplies(post.replies),
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        });
    });
    return returnVal;
}

export const parseNotification = (notifications: Notification[]) => {
    const returnVal = [];
    notifications.forEach((notification: Notification) => {
        returnVal.push({
            uuid: notification.uuid,
            to: parseUserSimple(notification.to),
            from: parseUserSimple(notification.from),
            type: notification.type,
            message: notification.message,
            uri: notification.uri,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
        })
    });
    return returnVal;
}
