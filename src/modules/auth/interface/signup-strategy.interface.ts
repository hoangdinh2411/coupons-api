import { SignUpDto } from "../dtos/auth.dto";

export interface SignUpStrategy{
    execute(data: SignUpDto):Promise<any>
}