float mt01Field(vec2 p,float t){float scratches=sin(p.y*150.+sin(p.x*7.)*4.)*.5+.5;float streak=pow(max(0.,1.-abs(p.x+.25*sin(t*.25))),7.);return .28*scratches+.95*streak;}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 mt01p=(fragCoord-.5*iResolution.xy)/iResolution.y*2.4;float mt01v=mt01Field(mt01p,iTime);float mt01band=.5+.5*cos(10.*mt01v);vec3 mt01col=mix(uColBg,uColInk,.25+.55*smoothstep(.15,.9,mt01band));mt01col=mix(mt01col,uColSignal,smoothstep(.82,.98,mt01band));mt01col+=uColAccent*.16*smoothstep(.08,0.,abs(fract(mt01v*1.7)-.5));fragColor=vec4(mt01col,1.);}
