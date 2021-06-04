import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {api_error_code, http_status, postgres_error_codes} from "../const/status";
import {Post} from "../models/entity/Post";
import {User} from "../models/entity/User";
import {client as rClient} from "../redis/rClient";
import {ValidationError} from "class-validator";

const removePostCache = async () => {
    const stream = rClient.scanStream({match: 'table_post_*'})
    stream.on('data', (keys) => {
        keys.forEach((key) => {
            rClient.del(key);
        });
    });
}

export const createPost = async (req: Request, res: Response) => {
    if (req.body.imageId) {
        try {
            const userRepository = getConnection().getRepository(User);
            const postRepository = getConnection().getRepository(Post);
            // ignoring the error here since the typing doesn't work
            // @ts-ignore
            const uuid = req.user.uuid;
            const user = await userRepository.findOneOrFail({
                where: {uuid: uuid},
                cache: {
                    id: `table_user_get_own_${uuid}`,
                    milliseconds: 300000
                }
            });
            const newPost = new Post();
            newPost.imageId = req.body.imageId;
            newPost.author = user;
            if (req.body.text) newPost.text = req.body.text;
            await postRepository.save(newPost);
            await removePostCache();
            res.json({
                error_code: api_error_code.no_error,
                message: "Successfully added a new test.",
                data: {
                    postId: newPost.uuid,
                    authorId: newPost.author.uuid,
                    imageId: newPost.imageId,
                    text: newPost.text,
                },
            });
        } catch (e) {
            if (e instanceof Array) {
                const constraints = [];
                e.forEach((_e) => {
                    if (_e instanceof ValidationError) {
                        constraints.push({property: _e.property, constraint: _e.constraints})
                    }
                });
                res.status(http_status.bad).json({
                    error_code: api_error_code.validation_error,
                    message: "Something went wrong when validating the input.",
                    data: {
                        error_name: "ValidationError",
                        error_detail: constraints
                    }
                });
            } else {
                res.status(http_status.error).json({
                    error_code: api_error_code.sql_error,
                    message: "Something went wrong.",
                    data: {
                        error_name: e.name,
                        error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
                    }
                });
            }
        }
    } else {
        res.status(http_status.bad).json({
            error_code: api_error_code.no_params,
            message: "Fix the required params!",
            data: {
                imageId: req.body.imageId ? "exists" : "not found",
            }
        });
    }
}

export const getOwnPosts = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        // default 25, max 100
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100)
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        const posts = await repository.find({
            relations: ["author", "likedBy"],
            where: {author: {uuid: uuid}},
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_post_get_own_${uuid}`,
                milliseconds: 300000
            }
        });
        const returnVal = [];
        posts.forEach((post: Post) => {
            const likedBy = [];
            post.likedBy.forEach((user: User) => {
                likedBy.push({name: user.name, uuid: user.uuid});
            });
            returnVal.push({
                postId: post.uuid,
                imageId: post.imageId,
                authorId: post.author.uuid,
                likedBy: likedBy,
            });
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                posts: returnVal,
            }
        });
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}

export const getPostsByUserUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        // default 25, max 100
        const limit = Math.min((req.query.limit) ? parseInt(req.query.limit as string, 10) : 25, 100)
        const page = (req.query.page) ? parseInt(req.query.page as string, 10) : 0;
        const posts = await repository.find({
            relations: ["author", "likedBy"],
            where: {author: {uuid: req.params.uuid}},
            take: limit,
            skip: page * limit,
            cache: {
                id: `table_post_get_user_uuid_${req.params.uuid}`,
                milliseconds: 300000
            }
        });
        const returnVal = [];
        posts.forEach((post: Post) => {
            const likedBy = [];
            post.likedBy.forEach((user: User) => {
                likedBy.push({name: user.name, uuid: user.uuid});
            });
            returnVal.push({
                postId: post.uuid,
                imageId: post.imageId,
                authorId: post.author.uuid,
                likedBy: likedBy,
            });
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                posts: returnVal,
            }
        });
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}

export const getPostByUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        const post = await repository.findOneOrFail({
            relations: ["author", "likedBy", "comments"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_post_get_uuid_${req.params.uuid}`,
                milliseconds: 300000
            }
        });
        const likedBy = [];
        post.likedBy.forEach((user: User) => {
            likedBy.push({name: user.name, uuid: user.uuid});
        });
        // const comments = [];
        // post.comments.forEach((comment: Comment) => {
        //     comments.push({
        //         au
        //     })
        // });
        res.json({
            error_code: api_error_code.no_error,
            message: "Posts fetched successfully.",
            data: {
                postId: post.uuid,
                imageId: post.imageId,
                authorId: post.author.uuid,
                likedBy: likedBy,
                comments: post.comments,
            }
        });
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}

export const likePost = async (req: Request, res: Response) => {
    if (req.body.postId) {
        try {
            const userRepository = getConnection().getRepository(User);
            const postRepository = getConnection().getRepository(Post);
            // ignoring the error here since the typing doesn't work
            // @ts-ignore
            const uuid = req.user.uuid;
            const user = await userRepository.findOneOrFail({
                where: {uuid: uuid},
                cache: {
                    id: `table_user_get_uuid_${uuid}`,
                    milliseconds: 300000
                }
            });
            const post = await postRepository.findOneOrFail({
                relations: ["author", "likedBy", "comments"],
                where: {uuid: req.body.postId},
                cache: {
                    id: `table_post_get_uuid_${req.body.postId}`,
                    milliseconds: 300000
                }
            });
            if (req.body.likeStatus) post.likedBy.push(user);
            else {
                post.likedBy.splice(post.likedBy.indexOf(user), 1);
            }
            await postRepository.save(post);
            await removePostCache();
            res.json({
                error_code: api_error_code.no_error,
                message: (req.body.likeStatus) ? "Liked successfully." : "Like removed successfully.",
                data: {}
            });
        } catch (e) {
            res.status(http_status.error).json({
                error_code: api_error_code.sql_error,
                message: "Something went wrong.",
                data: {
                    error_name: e.name,
                    error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
                }
            });
        }
    } else {
        res.status(http_status.bad).json({
            error_code: api_error_code.no_params,
            message: "Fix the required params!",
            data: {
                postId: req.body.postId ? "exists" : "not found",
                likeStatus: req.body.likeStatus ? "exists" : "not found",
            }
        });
    }
}

export const deletePost = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Post);
        const post = await repository.findOneOrFail({
            relations: ["author"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_post_get_uuid_${req.params.uuid}`,
                milliseconds: 300000
            }
        });
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        if (uuid === post.author.uuid) {
            await repository.delete(post);
            await removePostCache();
            res.json({
                error_code: api_error_code.no_error,
                message: "Post successfully deleted.",
                data: {}
            });
        } else {
            res.json({
                error_code: api_error_code.auth_error,
                message: "This user don't have the permission to delete this post.",
                data: {}
            });
        }
    } catch (e) {
        res.status(http_status.error).json({
            error_code: api_error_code.sql_error,
            message: "Something went wrong.",
            data: {
                error_name: e.name,
                error_detail: postgres_error_codes[e.code] || e.detail || e.message || "Unknown errors"
            }
        });
    }
}
