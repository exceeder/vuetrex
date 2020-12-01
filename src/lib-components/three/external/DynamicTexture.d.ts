import {
    Texture
} from 'three';

export class DynamicTexture implements CanvasDrawImage {
    constructor( width: number, height: number );
    public texture: Texture
    public context: CanvasRenderingContext2D
    clear(fillStyle: string | undefined): DynamicTexture
    drawText(text: string, x: number, y: number, fillStyle: string, contextFont?: string): DynamicTexture
    drawImage(image: CanvasImageSource, dx: number, dy: number): DynamicTexture;
    drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): DynamicTexture;
    drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): DynamicTexture;
}

