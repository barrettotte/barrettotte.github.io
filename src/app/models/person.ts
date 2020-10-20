import { Occupation } from './occupation';

export interface Person {
    firstName: string;
    lastName: string;
    degree: string;
    email: string;
    location: string;
    avatarUrl: string;
    occupation?: Occupation;
}
