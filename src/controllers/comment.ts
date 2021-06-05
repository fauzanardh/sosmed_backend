import {Request, Response} from "express";
import {getConnection} from "../db/connection";
import {api_error_code, http_status} from "../const/status";
import {Comment} from "../models/entity/Comment";
import {Post} from "../models/entity/Post";
import {User} from "../models/entity/User";
import {removeCommentCache, removePostCache} from "../utils/redis";
import {parseLikedBy} from "../utils/models";
import {handleErrors} from "../utils/errors";

export const createComment = async (req: Request, res: Response) => {
    try {
        // the first logical operation is actually xor
        // because, you can't have both parentPost and parentComment
        // using this current model
        if (req.body.parentPostId && (req.body.text || req.body.dataId)) {
            const postRepository = getConnection().getRepository(Post);
            const commentRepository = getConnection().getRepository(Comment);
            const userRepository = getConnection().getRepository(User);
            const parent = await postRepository.findOneOrFail({
                where: {uuid: req.body.parentPostId},
                cache: {
                    id: `table_post_get_uuid_${req.body.parentPostId}`,
                    milliseconds: 300000
                }
            });
            // ignoring the error here since the typing doesn't work
            // @ts-ignore
            const userId = req.user.uuid
            const user = await userRepository.findOneOrFail({
                where: {uuid: userId},
                cache: {
                    id: `table_user_get_own_${userId}`,
                    milliseconds: 300000
                }
            });
            const newComment = new Comment();
            newComment.author = user;
            newComment.parent = parent;
            if (req.body.dataId) newComment.dataId = req.body.dataId;
            if (req.body.text) newComment.text = req.body.text;
            await commentRepository.save(newComment);
            await removeCommentCache()
            await removePostCache()
            res.json({
                error_code: api_error_code.no_error,
                message: "Successfully added a new comment.",
                data: {
                    id: newComment.uuid,
                    parentId: newComment.parent.uuid,
                    dataId: newComment.dataId,
                    text: newComment.text,
                },
            });
        } else {
            let message = "";
            if (req.body.text || req.body.dataId) message += "Required at least one to be defined (text, dataId)! "
            if (!req.body.parentPostId !== !req.body.parentCommentId) message += "Can only have one defined (parentPostId, parentCommentId)! "
            res.status(http_status.bad).json({
                error_code: api_error_code.no_params,
                message: message,
                data: {
                    parentPostId: req.body.parentPostId ? "exists" : "not found",
                    parentCommentId: req.body.parentCommentId ? "exists" : "not found",
                    text: req.body.text ? "exists" : "not found",
                    dataId: req.body.dataId ? "exists" : "not found",
                }
            });
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

export const getCommentByUUID = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Comment);
        const comment = await repository.findOneOrFail({
            relations: ["author", "likedBy", "parent"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_comment_get_uuid_${req.params.uuid}`,
                milliseconds: 300000
            }
        });
        res.json({
            error_code: api_error_code.no_error,
            message: "Comment fetched successfully.",
            data: {
                id: comment.uuid,
                parentId: comment.parent.uuid,
                dataId: comment.dataId,
                text: comment.text,
                likedBy: parseLikedBy(comment.likedBy),
            },
        });
    } catch (e) {
        handleErrors(e, res);
    }
}

export const likeComment = async (req: Request, res: Response) => {
    try {
        const userRepository = getConnection().getRepository(User);
        const commentRepository = getConnection().getRepository(Comment);
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
        const comment = await commentRepository.findOneOrFail({
            relations: ["author", "likedBy"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_comment_get_uuid_${req.params.uuid}`,
                milliseconds: 300000
            }
        });
        const index = comment.likedBy.map((_u: User) => {
            return _u.uuid
        }).indexOf(user.uuid);
        if (req.body.likeStatus) {
            if (index === -1) {
                comment.likedBy.push(user);
                await commentRepository.save(comment);
                await removeCommentCache();
                await removePostCache();
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Liked successfully.",
                    data: {}
                });
            } else {
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Already liked successfully.",
                    data: {}
                });
            }
        } else {
            if (index !== -1) {
                comment.likedBy.splice(index, 1);
                await commentRepository.save(comment);
                await removeCommentCache();
                await removePostCache();
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Like removed successfully.",
                    data: {}
                });
            } else {
                res.json({
                    error_code: api_error_code.no_error,
                    message: "Not liked.",
                    data: {}
                });
            }
        }
    } catch (e) {
        handleErrors(e, res);
    }
}

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const repository = getConnection().getRepository(Comment);
        const comment = await repository.findOneOrFail({
            relations: ["author"],
            where: {uuid: req.params.uuid},
            cache: {
                id: `table_comment_get_uuid_${req.params.uuid}`,
                milliseconds: 300000
            }
        });
        // ignoring the error here since the typing doesn't work
        // @ts-ignore
        const uuid = req.user.uuid;
        if (uuid === comment.author.uuid) {
            await repository.delete(comment);
            await removeCommentCache()
            await removePostCache()
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
        handleErrors(e, res);
    }
}
