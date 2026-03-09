import { FutureData } from "$/data/api-futures";

export type StorageConnectionConfig = {
    url: string;
    username: string;
    password: string;
};

export interface StorageRepository {
    validateConnection(config: StorageConnectionConfig): FutureData<void>;
}
