import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    JoinTable,
    ManyToMany, CreateDateColumn, UpdateDateColumn
} from "typeorm";
import {IsDefined, validateOrReject} from "class-validator";
import {User} from "./User";
import {Post} from "./Post";

@Entity()
export class Reply extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(
        () => User,
        (user: User) => user.replies,
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
        (parent: Post) => parent.replies,
        {nullable: false}
    )
    @IsDefined()
    parent: Post;

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
