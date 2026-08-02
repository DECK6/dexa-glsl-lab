float op01Field(vec2 p,float t){float r=length(p);float z=sqrt(max(0.,1.-r*r));float view=clamp(z+.12*sin(t*.4+p.x*2.),0.,1.);return pow(1.-view,5.)+.08*sin(18.*r-t);}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 op01p=(fragCoord-.5*iResolution.xy)/iResolution.y*2.4;float op01v=op01Field(op01p,iTime);float op01band=.5+.5*cos(10.*op01v);vec3 op01col=mix(uColBg,uColInk,.25+.55*smoothstep(.15,.9,op01band));op01col=mix(op01col,uColSignal,smoothstep(.82,.98,op01band));op01col+=uColAccent*.16*smoothstep(.08,0.,abs(fract(op01v*1.7)-.5));fragColor=vec4(op01col,1.);}
