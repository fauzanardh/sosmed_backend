import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinTable,
    ManyToMany
} from "typeorm";
import {IsDefined, validateOrReject} from "class-validator";
import {User} from "./User";
import {Post} from "./Post";

@Entity()
export class Comment extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(
        () => User,
        (user: User) => user.comments,
        {nullable: false}
    )
    @IsDefined()
    author: User;

    @Column({length: 255, unique: true})
    dataId: string;

    @Column({length: 255})
    text: string;

    @ManyToMany(() => User)
    @JoinTable()
    likedBy: User[];

    @ManyToOne(
        () => Post,
        (parent: Post) => parent.comments,
        {nullable: false}
    )
    @IsDefined()
    parent: Post;

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }

}
