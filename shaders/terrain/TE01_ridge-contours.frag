float te01Field(vec2 p,float t){float h=.6*sin(p.x*1.7+t*.12)+.28*sin(p.x*4.3+p.y*1.2)+.18*cos(p.y*6.);return p.y-h*.55;}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 te01p=(fragCoord-.5*iResolution.xy)/iResolution.y*2.4;float te01v=te01Field(te01p,iTime);float te01band=.5+.5*cos(10.*te01v);vec3 te01col=mix(uColBg,uColInk,.25+.55*smoothstep(.15,.9,te01band));te01col=mix(te01col,uColSignal,smoothstep(.82,.98,te01band));te01col+=uColAccent*.16*smoothstep(.08,0.,abs(fract(te01v*1.7)-.5));fragColor=vec4(te01col,1.);}
