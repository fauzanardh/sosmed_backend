import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column({length: 64})
    name: string;

    @Column({length: 64, unique: true})
    username: string;

    @Column({nullable: true, unique: true})
    email: string;

    @Column({length: 64})
    password: string;

    @Column({length: 256, nullable: true})
    bio: string;

    @Column({nullable: true})
    profilePicturePath: string;
}
