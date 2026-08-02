float pl02Field(vec2 p,float t){p*=1.+.08*sin(t*.4);float r=dot(p,p);return abs(r*r-1.55*(p.x*p.x-p.y*p.y))/(1.+r*3.);}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 pl02q=(fragCoord-.5*iResolution.xy)/iResolution.y*2.8;float pl02f=pl02Field(pl02q,iTime);float pl02line=smoothstep(.12,.015,abs(fract(pl02f*.75)-.5));float pl02halo=smoothstep(.45,.02,abs(pl02f));vec3 pl02c=mix(uColBg,uColDim,.22+.35*pl02halo);pl02c=mix(pl02c,uColPaper,pl02line);pl02c+=uColSignal*pl02halo*.35+uColAccent*pl02line*.18;fragColor=vec4(pl02c,1.);}
