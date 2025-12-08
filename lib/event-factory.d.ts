/**
 * Method event listener (pub/sub type thing)
 */
export default class EventFactory {
    collection: {};
    on(event: any, action: any): void;
    trigger(event: any, data: any): void;
}
