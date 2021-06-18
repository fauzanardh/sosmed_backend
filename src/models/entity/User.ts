import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    OneToMany,
    ManyToMany,
    JoinTable
} from "typeorm";
import {validateOrReject, IsOptional, IsDefined, IsEmail, IsAlphanumeric} from 'class-validator';
import {Reply} from "./Reply";
import {Post} from "./Post";
import {Notification} from "./Notification";

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({length: 63})
    @IsDefined()
    name: string;

    @Column({length: 63, unique: true})
    @IsDefined()
    @IsAlphanumeric()
    username: string;

    @Column({nullable: true, unique: true})
    @IsOptional()
    @IsEmail()
    email: string;

    @Column({length: 63})
    @IsDefined()
    password: string;

    @Column({length: 255, nullable: true})
    @IsOptional()
    bio: string;

    @Column({nullable: true})
    @IsOptional()
    profilePictureDataId: string;

    @ManyToMany(() => User)
    @JoinTable()
    following: User[];

    @ManyToMany(() => User)
    @JoinTable()
    followers: User[];

    @OneToMany(
        () => Reply,
        (reply: Reply) => reply.author
    )
    replies: Reply[];

    @OneToMany(
        () => Post,
        (post: Post) => post.author
    )
    posts: Post[];

    @OneToMany(
        () => Notification,
        (notification: Notification) => notification.to
    )
    recvNotifications: Notification[];

    // @OneToMany(
    //     () => Notification,
    //     (notification: Notification) => notification.to
    // )
    // sendNotifications: Notification[];

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }
}
