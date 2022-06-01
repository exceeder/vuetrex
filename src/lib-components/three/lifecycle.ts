import Element3d from "./element3d";

export interface Tween {
    target?: object
    duration: number
    start?: { [key: string]: any }
    end?: { [key: string]: any }
    fn: (timer: number, ticks: number) => void
}

export default class LifeCycle {

    /**
     * array of functions called on each animation frame
     */
    private tweens:Tween[]  =  []

    private fps = 30;
    private timeout: any = 0;
    private animationId: number = 0;

    lifecycle = {
        paused: false,
        tick: 0, //ongoing counter of frames rendered excluding pauses
        timer: {
            current: 0, //total time in ms since animation started, excluding pauses
            last: performance.now()
        },

    }

    static tween(el: Element3d, key: string, targetValue: any) {

    }

    constructor() {
    }

    mount(scene: object) {
        throw new Error("Abstract");
    }

    render() {
        throw new Error("Abstract");
    }

    pause() {
        this.lifecycle.paused = true;
    }

    unpause() {
        this.lifecycle.paused = false;
    }

    animate() {
        if (this.fps > 60) {
            this.animationId = requestAnimationFrame(() => this.animate());
        } else {
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.animationId = requestAnimationFrame(() => this.animate());
            }, 1000 / 30);
        }

        const timer = this.lifecycle.timer;
        const t = performance.now();
        if (this.lifecycle.paused) {
            timer.last = t;
        } else {
            timer.current += t - timer.last;
            timer.last = t;
            this.lifecycle.tick++;
            this.tweens.forEach(t =>
                t.fn(timer.current, this.lifecycle.tick)
            );
            this.render();
        }
    }

    onAnimate(fn: (timer: number, ticks: number) => void) {
        this.tweens.push({
            duration: -1,
            fn: fn
        });
    }

    stopAnimation() {
        clearTimeout(this.timeout);
        cancelAnimationFrame(this.animationId);
    }
}
