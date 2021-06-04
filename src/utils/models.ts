import {User} from "../models/entity/User";
import {Post} from "../models/entity/Post";

export const parseFollow = (users: User[]) => {
    const returnVal = [];
    users.forEach((_follow: User) => {
        returnVal.push({
            uuid: _follow.uuid,
            name: _follow.name,
        });
    });
    return returnVal;
}

export const parseUsers = (users: User[]) => {
    const returnVal = [];
    users.forEach((user: User) => {
        returnVal.push({
            uuid: user.uuid,
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
            uuid: user.uuid,
            name: user.name,
        });
    });
    return returnVal;
}

export const parsePosts = (posts: Post[]) => {
    const returnVal = [];
    posts.forEach((post: Post) => {
        returnVal.push({
            uuid: post.uuid,
            imageId: post.imageId,
            likedBy: parseLikedBy(post.likedBy),
        });
    });
    return returnVal;
}
