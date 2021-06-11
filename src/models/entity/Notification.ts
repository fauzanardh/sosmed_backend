import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity,
    BeforeInsert,
    BeforeUpdate, OneToOne,
} from "typeorm";
import {validateOrReject, IsDefined, IsUUID} from 'class-validator';
import {User} from "./User";
import {JoinColumn} from "typeorm";
import { notification_type } from "../../const/status";

@Entity()
export class Notification extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @OneToOne(() => User)
    @JoinColumn()
    @IsDefined()
    from: User;

    @OneToOne(() => User)
    @JoinColumn()
    @IsDefined()
    to: User;

    @Column('int')
    @IsDefined()
    type: notification_type;

    @Column()
    @IsDefined()
    message: string;

    @Column()
    @IsUUID()
    @IsDefined()
    uuidToData: string;

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
