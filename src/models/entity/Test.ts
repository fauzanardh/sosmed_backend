import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Test {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 64 })
    name: string;

    @Column()
    description: string;

    @Column({ type: 'timestamptz' })
    created_on: Date;
}
