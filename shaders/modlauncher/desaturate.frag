#pragma header

uniform float u_mix;

void main() {
	gl_FragColor = flixel_texture2D(bitmap, openfl_TextureCoordv);
	if (u_mix <= 0.0) {
		return;
	}
	
	gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3((gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0), u_mix);
}