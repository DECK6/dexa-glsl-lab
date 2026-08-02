float cm01Field(vec2 p,float t){float lat=2.*atan(exp(p.y*.9))-1.5708;float lon=p.x+t*.08;return min(abs(fract(lon*3.)-.5),abs(fract(lat*4.)-.5));}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 cm01p=(fragCoord-.5*iResolution.xy)/iResolution.y*2.4;float cm01v=cm01Field(cm01p,iTime);float cm01band=.5+.5*cos(10.*cm01v);vec3 cm01col=mix(uColBg,uColInk,.25+.55*smoothstep(.15,.9,cm01band));cm01col=mix(cm01col,uColSignal,smoothstep(.82,.98,cm01band));cm01col+=uColAccent*.16*smoothstep(.08,0.,abs(fract(cm01v*1.7)-.5));fragColor=vec4(cm01col,1.);}
