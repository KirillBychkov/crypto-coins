import { EventEmitter } from "events";

function pseudoInterval(options) {
    const { id, handler, forceExit, interval, eventEmitter } = options;

    setTimeout( () => {
        handler()
            .then(result => {
                const { continueRunning, data } = result;
                if (!continueRunning) {
                    eventEmitter.emit(id, data);
                }
            })
            .catch(error => {
                console.error('error', error)
            })
            .finally(() => {
                if (!forceExit) {
                    pseudoInterval(options);
                }
            });
    }, interval);
}

class TaskRunner {
    constructor(options) {
        this.options = options;
        pseudoInterval(this.options);
    }

    exit() {
        this.options.forceExit = true;
    }
}

class TaskController {
    constructor() {
        this.eventEmitter = new EventEmitter();
        this.eventEmitter.setMaxListeners(500);
        this.taskRunners = new Map();
    }

    getRunnerSize() {
       return this.taskRunners.size;
    }

    start(id, handler) {
        if (!this.taskRunners.has(id)) {
            this.eventEmitter.on(id, data => {
                this.eventEmitter.removeAllListeners(id);
                this.stop(id);
            });

            this.taskRunners.set(id, new TaskRunner({
                id,
                handler,
                interval: 30000,
                forceExit: false,
                eventEmitter: this.eventEmitter,
            }));
        }
    }

    stop(id) {
        if (this.taskRunners.has(id)) {
            this.taskRunners.get(id).exit();
            this.taskRunners.delete(id);
        }
    }
}

export const taskController = new TaskController();
