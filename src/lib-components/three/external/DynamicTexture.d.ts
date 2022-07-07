import {
    Texture
} from 'three';

export class DynamicTexture implements CanvasDrawImage, CanvasFillStrokeStyles, CanvasRect {
    constructor( width: number, height: number );
    public texture: Texture
    public context: CanvasRenderingContext2D
    public fillStyle: string | CanvasGradient | CanvasPattern;
    public strokeStyle: string | CanvasGradient | CanvasPattern;

    clear(fillStyle: string | undefined): DynamicTexture
    drawText(text: string, x: number, y: number, fillStyle: string, contextFont?: string): DynamicTexture
    drawImage(image: CanvasImageSource, dx: number, dy: number): DynamicTexture;
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): DynamicTexture;
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): DynamicTexture;
    createConicGradient(startAngle: number, x: number, y: number): CanvasGradient;
    createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient;
    createPattern(image: CanvasImageSource, repetition: string | null): CanvasPattern | null;
    createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient;

    clearRect(x: number, y: number, w: number, h: number): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;

    setGlobalAlpha(a: number): void;
}

