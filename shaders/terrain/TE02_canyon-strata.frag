float te02Field(vec2 p,float t){float river=.25*sin(p.y*1.8+t*.2)+.08*sin(p.y*7.);float wall=abs(p.x-river);float strata=sin((p.y+wall*.8)*18.);return wall-.35+.07*strata;}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 te02q=(fragCoord-.5*iResolution.xy)/iResolution.y*2.8;float te02f=te02Field(te02q,iTime);float te02line=smoothstep(.12,.015,abs(fract(te02f*.75)-.5));float te02halo=smoothstep(.45,.02,abs(te02f));vec3 te02c=mix(uColBg,uColDim,.22+.35*te02halo);te02c=mix(te02c,uColPaper,te02line);te02c+=uColSignal*te02halo*.35+uColAccent*te02line*.18;fragColor=vec4(te02c,1.);}
