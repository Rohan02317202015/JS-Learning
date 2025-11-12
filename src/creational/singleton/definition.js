export const EVENT = Object.freeze({
    CTA_CLICK: 'cta_click',
    PAGE_MOUNT: 'page_mount',
    PAGE_UNMOUNT: 'page_unmount'
});

export const STATUS = Object.freeze({
    IDLE: 'idle',
    COUNTDOWN: 'countdown',
    UPLOADING: 'uploading',
    UPLOADED: 'uploaded'
});


export class AnalyticalLogger {


    #uploadInterval = 5000; // Time in seconds to upload log
    #cachedEvents = []; // In memory cache of logged events, till last upload
    #uploadJob = null // Current upload job
    #timeLeft = 5000 //  countdown time left 
    #callback = null; // user-registered callback
    #currentStatus = STATUS.IDLE;


    constructor() {
        if (AnalyticalLogger.instance) {
            return AnalyticalLogger.instance;
        }
        AnalyticalLogger.instance = this;
    }

    registerStatusListener(cb){
        if(typeof cb === 'function'){ 
            this.#callback = cb;
            this.#currentStatus = STATUS.IDLE;
            this.#invokeCallback(this.#currentStatus, {});
        }
    }

    #invokeCallback(status, payload = {}) {
        this.#currentStatus = status;
        const result = { status, payload };

        try{
            if(this.#callback){
                // do not call with setTimeout here
                // instead, call directly to ensure 
                // either immediate run or blocking other code
                this.#callback(status, payload);
            }

        } catch (err){
            console.error('Callback error:', err);
        }
    }

    logEvent(eventType, eventData) {
        // Logic to log the event
        const event = { type: eventType, data: eventData, timestamp: new Date().toISOString() };
        this.#cachedEvents.push(event);

        this.#startCountDown();
    }

    #startCountDown(){
        this.#timeLeft = this.#uploadInterval;

        if(this.#uploadJob){
            clearInterval(this.#uploadJob);
        }

        this.#uploadJob = setInterval(() => {
            this.#timeLeft -= 1000;
            if(this.#timeLeft <= 0){
                clearInterval(this.#uploadJob);
                this.#uploadJob = null;
                this.#uploadEvents();
            } else { 
                this.#invokeCallback(STATUS.COUNTDOWN, { timeLeft: this.#timeLeft });
            }
        }, 1000);
    }

    async #uploadEvents() {
        if (this.#cachedEvents.length === 0) {
            return this.#invokeCallback(STATUS.IDLE, { message: 'No events to upload' });
        }

        // notify uploading
        this.#invokeCallback(STATUS.UPLOADING, { uploadingCount: this.#cachedEvents.length });

        // Simulate uploading events to a server
        console.log("Uploading events to Server:", this.#cachedEvents);

        // simulate async delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // copy and clear cached events after upload
        const uploaded = this.#cachedEvents.slice();
        this.#cachedEvents = [];

       this.#invokeCallback(STATUS.UPLOADED, { uploadedCount: uploaded.length, uploaded });
    }   

}
