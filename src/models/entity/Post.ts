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
import {Reply} from "./Reply";

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
        () => Reply,
        (reply: Reply) => reply.parent,
    )
    replies: Reply[];

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }

}
