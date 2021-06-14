import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {User} from "../models/entity/User";
import {api_error_code} from "../const/status";
import {parsePosts} from "../utils/models";
import {handleErrors} from "../utils/errors";
import {Post} from "../models/entity/Post";

export const getFeed = async (req: Request, res: Response) => {
    try {
        const postRepository = getConnection().getRepository(Post);
        const userRepository = getConnection().getRepository(User);
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const me = await userRepository.findOneOrFail({
            relations: ["following"],
            where: {uuid: uuid},
            cache: {
                id: `table_user_get_uuid_${uuid}`,
                milliseconds: 25000
            }
        });
        const where = [];
        me.following.forEach((user: User) => {
            where.push({author: {uuid: user.uuid}});
        });
        if (where.length === 0) {
            res.json({
                errorCode: api_error_code.no_error,
                message: "Posts fetched successfully.",
                data: {
                    posts: [],
                }
            });
        } else {
            const posts = await postRepository.find({
                relations: ["author", "likedBy", "replies", "replies.author", "replies.likedBy"],
                where: where,
                order: {
                    createdAt: "DESC",
                },
                cache: {
                    id: `table_post_get_own_feed_${uuid}`,
                    milliseconds: 25000
                }
            });
            res.json({
                errorCode: api_error_code.no_error,
                message: "Posts fetched successfully.",
                data: {
                    posts: parsePosts(posts),
                }
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}
