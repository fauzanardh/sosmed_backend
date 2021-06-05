import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    OneToMany,
    JoinTable,
    ManyToMany
} from "typeorm";
import {validateOrReject, IsOptional, IsDefined} from 'class-validator';
import {User} from "./User";
import {Comment} from "./Comment";

@Entity()
export class Post extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(
        () => User,
        (author: User) => author.posts,
        {nullable: false}
    )
    @IsDefined()
    author: User;

    @Column({length: 255, unique: true})
    @IsDefined()
    dataId: string;

    @Column({length: 255})
    @IsOptional()
    text: string;

    @ManyToMany(() => User)
    @JoinTable()
    likedBy: User[];

    @OneToMany(
        () => Comment,
        (comment: Comment) => comment.parent,
    )
    comments: Comment[];

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }

}
