import {User} from "../models/entity/User";
import {Post} from "../models/entity/Post";
import {Comment} from "../models/entity/Comment";

export const parseFollow = (users: User[]) => {
    const returnVal = [];
    users.forEach((_follow: User) => {
        returnVal.push({
            id: _follow.uuid,
            name: _follow.name,
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
            profilePicturePath: user.profilePicturePath,
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

export const parseComments = (comments: Comment[]) => {
    const returnVal = [];
    comments.forEach((comment: Comment) => {
        returnVal.push({
            id: comment.uuid,
            parentId: comment.parent.uuid,
            dataId: comment.dataId,
            text: comment.text,
            likedBy: parseLikedBy(comment.likedBy),
        });
    });
    return returnVal;
}

export const parsePosts = (posts: Post[]) => {
    const returnVal = [];
    posts.forEach((post: Post) => {
        returnVal.push({
            id: post.uuid,
            dataId: post.dataId,
            text: post.text,
            likedBy: parseLikedBy(post.likedBy),
            comments: parseComments(post.comments)
        });
    });
    return returnVal;
}
