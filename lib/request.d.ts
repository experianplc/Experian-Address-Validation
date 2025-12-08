export default class Request {
    instance: any;
    constructor(instance: any);
    currentRequest: any;
    send(url: string, method: 'GET' | 'POST', callback: (data: object) => void, data?: string, headers?: {
        key: string;
        value: string | boolean;
    }[]): void;
}
