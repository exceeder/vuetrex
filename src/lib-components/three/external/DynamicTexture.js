// from https://github.com/jeromeetienne/threex.dynamictexture/blob/master/threex.dynamictexture.js

import {
    Texture
} from 'three';

//////////////////////////////////////////////////////////////////////////////////
//		           Constructor                       							//
//////////////////////////////////////////////////////////////////////////////////

/**
 * create a dynamic texture with a underlying canvas
 *
 * @param {Number} width  width of the canvas
 * @param {Number} height height of the canvas
 */
const DynamicTexture = function(width, height){
    const canvas	= document.createElement( 'canvas' )
    canvas.width	= width
    canvas.height	= height
    this.canvas	= canvas
    this.context	= canvas.getContext('2d')
    this.texture	= new Texture(canvas)
}

//////////////////////////////////////////////////////////////////////////////////
//		methods								//
//////////////////////////////////////////////////////////////////////////////////

/**
 * clear the canvas
 *
 * @param  {String?} fillStyle 		the fillStyle to clear with, if not provided, fallback on .clearRect
 * @return {THREEx.DynamicTexture}      the object itself, for chained texture
 */
DynamicTexture.prototype.clear = function(fillStyle){
    // depends on fillStyle
    if( fillStyle !== undefined ){
        this.context.fillStyle	= fillStyle
        this.context.fillRect(0,0,this.canvas.width, this.canvas.height)
    } else {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height)
    }
    // make the texture as .needsUpdate
    this.texture.needsUpdate	= true;
    // for chained API
    return this;
}

/**
 * draw text
 *
 * @param  {String}		text	- the text to display
 * @param  {Number|undefined}	x	- if provided, it is the x where to draw, if not, the text is centered
 * @param  {Number}		y	- the y where to draw the text
 * @param  {String?} 		fillStyle - the fillStyle to clear with, if not provided, fallback on .clearRect
 * @param  {String?} 		contextFont - the font to use
 * @return {THREEx.DynamicTexture}	- the object itself, for chained texture
 */
DynamicTexture.prototype.drawText = function(text, x, y, fillStyle, contextFont){
    // set font if needed
    if( contextFont !== undefined )	this.context.font = contextFont;
    // if x isnt provided
    if( x === undefined || x === null ){
        const textSize	= this.context.measureText(text);
        x = (this.canvas.width - textSize.width) / 2;
    }
    // actually draw the text
    this.context.fillStyle = fillStyle;
    this.context.fillText(text, x, y);
    // make the texture as .needsUpdate
    this.texture.needsUpdate	= true;
    // for chained API
    return this;
};

DynamicTexture.prototype.drawTextCooked = function(options){
    const context	= this.context
    const canvas	= this.canvas
    options		= options	|| {}
    let text	= options.text
    const params	= {
        margin		: options.margin !== undefined ? options.margin	: 0.1,
        lineHeight	: options.lineHeight !== undefined ? options.lineHeight : 0.1,
        align		: options.align !== undefined ? options.align : 'left',
        fillStyle	: options.fillStyle !== undefined ? options.fillStyle : 'black',
        font		: options.font !== undefined ? options.font : "bold "+(0.2*512)+"px Arial",
    }
    // sanity check
    console.assert(typeof(text) === 'string')

    context.save()
    context.fillStyle	= params.fillStyle;
    context.font		= params.font;

    let y	= (params.lineHeight + params.margin)*canvas.height
    while(text.length > 0 ){
        // compute the text for specifically this line
        const maxText	= computeMaxTextLength(text)
        // update the remaining text
        text	= text.substr(maxText.length)


        // compute x based on params.align
        const textSize	= context.measureText(maxText);
        let x;
        if ( params.align === 'left' ){
            x	= params.margin*canvas.width
        } else if( params.align === 'right' ){
            x	= (1-params.margin)*canvas.width - textSize.width
        } else if( params.align === 'center' ){
            x = (canvas.width - textSize.width) / 2;
        } else
            console.assert( false )

        // actually draw the text at the proper position
        this.context.fillText(maxText, x, y);

        // goto the next line
        y += params.lineHeight*canvas.height
    }
    context.restore()

    // make the texture as .needsUpdate
    this.texture.needsUpdate	= true;
    // for chained API
    return this;

    function computeMaxTextLength(text){
        let maxText	= ''
        let maxWidth	= (1-params.margin*2)*canvas.width
        while( maxText.length !== text.length ){
            const textSize	= context.measureText(maxText);
            if( textSize.width > maxWidth )	break;
            maxText	+= text.substr(maxText.length, 1)
        }
        return maxText
    }
}

/**
 * execute the drawImage on the internal context
 * the arguments are the same the official context2d.drawImage
 */
DynamicTexture.prototype.drawImage	= function(/* same params as context2d.drawImage */){
    // call the drawImage
    this.context.drawImage.apply(this.context, arguments)
    // make the texture as .needsUpdate
    this.texture.needsUpdate	= true;
    // for chained API
    return this;
}

export {DynamicTexture}