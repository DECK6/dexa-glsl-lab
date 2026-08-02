float cm02Field(vec2 p,float t){float r=length(p),a=atan(p.y,p.x)+t*.05;return min(abs(fract(r*4.)-.5),abs(fract(a/6.28318*16.)-.5));}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 cm02q=(fragCoord-.5*iResolution.xy)/iResolution.y*2.8;float cm02f=cm02Field(cm02q,iTime);float cm02line=smoothstep(.12,.015,abs(fract(cm02f*.75)-.5));float cm02halo=smoothstep(.45,.02,abs(cm02f));vec3 cm02c=mix(uColBg,uColDim,.22+.35*cm02halo);cm02c=mix(cm02c,uColPaper,cm02line);cm02c+=uColSignal*cm02halo*.35+uColAccent*cm02line*.18;fragColor=vec4(cm02c,1.);}
