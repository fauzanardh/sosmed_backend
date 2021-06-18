import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {User} from "../models/entity/User";
import {ILike} from "typeorm";
import {api_error_code, http_status} from "../const/status";
import {parsePosts, parseUsers} from "../utils/models";
import {handleErrors} from "../utils/errors";
import {Post} from "../models/entity/Post";

export const search = async (req: Request, res: Response) => {
    try {
        if (req.query.keyword) {
            const postRepository = getConnection().getRepository(Post);
            const userRepository = getConnection().getRepository(User);
            // limit per tag/user - default 5, max 20
            const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 5, 20);
            const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
            let posts: Post[] = [];
            let users: User[] = [];
            let regexResult;
            // search for word with hashtag in front of it
            const tagsRegex = /\B(?<tag>#[a-z]+\b)/gmi;
            const keyword = decodeURI(req.query.keyword as string);
            do {
                regexResult = tagsRegex.exec(keyword);
                if (regexResult) {
                    const _posts = await postRepository.find({
                        relations: [
                            "author",
                            "likedBy",
                            "replies",
                            "replies.author",
                            "replies.likedBy"
                        ],
                        where: [
                            {text: ILike(`%${regexResult.groups.tag}%`)}
                        ],
                        take: limit,
                        skip: page * limit,
                        cache: {
                            id: `table_post_search_${regexResult.groups.tag}_${limit}_${page}`,
                            milliseconds: 25000,
                        }
                    });
                    posts.push(..._posts);
                }
            } while (regexResult);
            if (posts.length === 0) {
                // search user
                users = await userRepository.find({
                    relations: ["following", "followers"],
                    where: [
                        {name: ILike(`%${keyword}%`)},
                        {username: ILike(`%${keyword}%`)},
                    ],
                    take: limit,
                    skip: page * limit,
                    cache: {
                        id: `table_user_search_${keyword}_${limit}_${page}`,
                        milliseconds: 25000
                    }
                });
            }
            res.json({
                errorCode: api_error_code.no_error,
                message: "Search",
                data: {
                    users: parseUsers(users),
                    posts: parsePosts(posts),
                }
            });
        } else {
            res.status(http_status.bad).json({
                errorCode: api_error_code.no_params,
                message: "Fix the required params!",
                data: {
                    keyword: req.query.keyword ? "exists" : "not found",
                }
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}
