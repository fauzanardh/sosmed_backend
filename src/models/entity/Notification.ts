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
} from "typeorm";
import {validateOrReject, IsDefined} from 'class-validator';
import {User} from "./User";
import {JoinColumn} from "typeorm";
import {notification_type} from "../../const/status";

@Entity()
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @ManyToOne(
        () => User,
        (user: User) => user.recvNotifications,
        {nullable: false}
    )
    @JoinColumn()
    @IsDefined()
    to: User;

    @ManyToOne(
        () => User,
        (user: User) => user.sendNotifications,
        {nullable: false}
    )
    @JoinColumn()
    @IsDefined()
    from: User;

    @Column('int')
    @IsDefined()
    type: notification_type;

    @Column()
    @IsDefined()
    message: string;

    @Column()
    @IsDefined()
    uri: string;

    @Column({default: false})
    isRead: boolean;

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
