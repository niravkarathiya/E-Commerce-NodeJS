import { compare, hash } from "bcryptjs";
import { createHmac } from "crypto";

export const doHash = async (value: string, saltValue: number): Promise<string> => {
    const result = await hash(value, saltValue);
    return result;
}

export const doHashValidation = async (value: string, hashedValue: string): Promise<boolean> => {
    const result = await compare(value, hashedValue);
    return result;
}

export const hmacProcess = (value: any, key: any): string => {
    const result = createHmac('sha256', key).update(value).digest('hex');
    return result;
}

