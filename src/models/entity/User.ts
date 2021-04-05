import {Entity, Column, PrimaryGeneratedColumn, BaseEntity, BeforeInsert, BeforeUpdate} from "typeorm";
import {validateOrReject, IsOptional, IsDefined, IsEmail, IsAlphanumeric} from 'class-validator';

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({length: 64})
    @IsDefined()
    name: string;

    @Column({length: 64, unique: true})
    @IsDefined()
    @IsAlphanumeric()
    username: string;

    @Column({nullable: true, unique: true})
    @IsOptional()
    @IsEmail()
    email: string;

    @Column({length: 64})
    @IsDefined()
    password: string;

    @Column({length: 256, nullable: true})
    @IsOptional()
    bio: string;

    @Column({nullable: true})
    @IsOptional()
    profilePicturePath: string;

    @BeforeInsert()
    @BeforeUpdate()
    private validate(): Promise<void> {
        return validateOrReject(this);
    }
}
