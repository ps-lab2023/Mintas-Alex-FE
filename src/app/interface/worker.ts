import { Job } from "../enum/job.enum";

export interface Worker {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    age: number;
    job: Job;
}