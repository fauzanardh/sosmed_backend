import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinTable,
    OneToMany,
    ManyToMany
} from "typeorm";
import {IsDefined, validateOrReject} from "class-validator";
import {User} from "./User";
import {Post} from "./Post";

@Entity()
export class Comment extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({length: 255})
    @IsDefined()
    text: string;

    @ManyToOne(
        () => User,
        (user: User) => user.comments,
        {nullable: false}
    )
    @IsDefined()
    author: User;

    @ManyToMany(() => User)
    @JoinTable()
    likedBy: User[];

    @OneToMany(
        () => Comment,
        (comment: Comment) => comment.parent,
    )
    comments: Comment[];

    @ManyToOne(
        () => Post || Comment,
        (parent: Post | Comment) => parent.comments,
        {nullable: false}
    )
    @IsDefined()
    parent: Post | Comment;

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }

}
