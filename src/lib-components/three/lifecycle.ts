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
    //private timeline: gsap.core.Timeline = gsap.timeline({paused: true});

    private fps: number = 25;
    private lastRenderTime: number;
    private timeout: any = 0;
    private animationId: number = 0;
    private animateFn: (time: number) => void;

    lifecycle = {
        paused: false,
        tick: 0, //ongoing counter of frames rendered excluding pauses
        timer: {
            current: 0, //total time in ms since animation started, excluding pauses
            last: performance.now()
        },

    }


    constructor() {
        this.animateFn = (time: number) => this.animate(time);
        this.lastRenderTime = 0;
    }

    mount(scene: object) {}

    render() {}

    pause() {
        this.lifecycle.paused = true;
    }

    unpause() {
        this.lifecycle.paused = false;
    }

    animate(time: number) {
        this.animationId = requestAnimationFrame(this.animateFn);

        const elapsed = time - this.lastRenderTime;
        if (elapsed < 1000/this.fps) return;
        this.lastRenderTime = time;

        const timer = this.lifecycle.timer;
        const t = performance.now();
        if (this.lifecycle.paused) {
            timer.last = t;
        } else {
            timer.current += t - timer.last;
            timer.last = t;
            this.lifecycle.tick++;
            //this.timeline. ??? todo
            this.tweens.forEach(t =>
                t.fn(timer.current, this.lifecycle.tick)
            );
            this.render();
        }
    }

    // todo remove
    registerAnimation(fn: (timer: number, ticks: number) => void) {
        this.tweens.push({
            duration: -1,
            fn: fn
        });
    }

    stopRenderLoop() {
        clearTimeout(this.timeout);
        cancelAnimationFrame(this.animationId);
    }
}
