float pl01Field(vec2 p,float t){float y=.38*sin(2.7*p.x+t)+.21*sin(6.1*p.x-t*.7)+.1*sin(13.*p.x+t*.3);return abs(p.y-y);}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 pl01p=(fragCoord-.5*iResolution.xy)/iResolution.y*2.4;float pl01v=pl01Field(pl01p,iTime);float pl01band=.5+.5*cos(10.*pl01v);vec3 pl01col=mix(uColBg,uColInk,.25+.55*smoothstep(.15,.9,pl01band));pl01col=mix(pl01col,uColSignal,smoothstep(.82,.98,pl01band));pl01col+=uColAccent*.16*smoothstep(.08,0.,abs(fract(pl01v*1.7)-.5));fragColor=vec4(pl01col,1.);}
