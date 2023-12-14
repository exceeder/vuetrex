import {
	Mesh,
	BufferGeometry,
	Color,
	WebGLRenderTarget
} from 'three';

export interface ReflectorOptions {
	color?: Color;
	textureWidth?: number;
	textureHeight?: number;
	clipBias?: number;
	shader?: object;
	multisample?: number;
}

export class Reflector extends Mesh {

	constructor( geometry?: BufferGeometry, options?: ReflectorOptions );

	getRenderTarget(): WebGLRenderTarget;

}
