export default class LifeCycle {

    tweens:Function[]  =  []

    private _timeout: any  = 0

    lifecycle = {
        paused: false,
        tick: 0,
        timer: {
            current: 0,
            last: performance.now()
        },

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
        clearTimeout(this._timeout);
        this._timeout = setTimeout(() => {
            requestAnimationFrame(() => this.animate());
        }, 1000 / 30);

        const timer = this.lifecycle.timer;
        const t = performance.now();
        if (this.lifecycle.paused) {
            timer.last = t;
        } else {
            timer.current += t - timer.last;
            timer.last = t;
            if (++this.lifecycle.tick < 0) this.lifecycle.tick = 0;
            this.tweens.forEach(fn =>
                fn(timer.current, this.lifecycle.tick)
            );
            this.render();
        }
    }

    onAnimate(fn: Function) {
        this.tweens.push(fn);
    }

    stopAnimation() {
        clearTimeout(this._timeout);
    }
}
