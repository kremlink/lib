/**
 * JavaScript implementation of common blending modes, based on
 * http://stackoverflow.com/questions/5919663/how-does-photoshop-blend-two-images-together
 *
 * Note that I'm not using <code>this</code> to reference current object
 * for faster execution
 */
var blendingModes = {
	normal: function(a, b) {
		return a;
	},

	lighten: function(a, b) {
		return (b > a) ? b : a;
	},

	darken: function(a, b) {
		return (b > a) ? a : b;
	},

	multiply: function(a, b) {
		return (a * b) / 255;
	},

	average: function(a, b) {
		return (a + b) / 2;
	},

	add: function(a, b) {
		return Math.min(255, a + b);
	},

	substract: function(a, b) {
		return (a + b < 255) ? 0 : a + b - 255;
	},

	difference: function(a, b) {
		return Math.abs(a - b);
	},

	negation: function(a, b) {
		return 255 - Math.abs(255 - a - b);
	},

	screen: function(a, b) {
		return 255 - (((255 - a) * (255 - b)) >> 8);
	},

	exclusion: function(a, b) {
		return a + b - 2 * a * b / 255;
	},

	overlay: function(a, b) {
		return b < 128
			? (2 * a * b / 255)
			: (255 - 2 * (255 - a) * (255 - b) / 255);
	},

	softLight: function(a, b) {
		return b < 128
			? (2 * ((a >> 1) + 64)) * (b / 255)
			: 255 - (2 * (255 - (( a >> 1) + 64)) * (255 - b) / 255);
	},

	hardLight: function(a, b) {
		return blendingModes.overlay(b, a);
	},

	colorDodge: function(a, b) {
		return b == 255 ? b : Math.min(255, ((a << 8 ) / (255 - b)));
	},

	colorBurn: function(a, b) {
		return b == 0 ? b : Math.max(0, (255 - ((255 - a) << 8 ) / b));
	},

	linearDodge: function(a, b) {
		return blendingModes.add(a, b);
	},

	linearBurn: function(a, b) {
		return blendingModes.substract(a, b);
	},

	linearLight: function(a, b) {
		return b < 128
			? blendingModes.linearBurn(a, 2 * b)
			: blendingModes.linearDodge(a, (2 * (b - 128)));
	},

	vividLight: function(a, b) {
		return b < 128
			? blendingModes.colorBurn(a, 2 * b)
			: blendingModes.colorDodge(a, (2 * (b - 128)));
	},

	pinLight: function(a, b) {
		return b < 128
			? blendingModes.darken(a, 2 * b)
			: blendingModes.lighten(a, (2 * (b - 128)));
	},

	hardMix: function(a, b) {
		return blendingModes.vividLight(a, b) < 128 ? 0 : 255;
	},

	reflect: function(a, b) {
		return b == 255 ? b : Math.min(255, (a * a / (255 - b)));
	},

	glow: function(a, b) {
		return blendingModes.reflect(b, a);
	},

	phoenix: function(a, b) {
		return Math.min(a, b) - Math.max(a, b) + 255;
	}
};