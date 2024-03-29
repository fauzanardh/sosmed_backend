import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }

}
