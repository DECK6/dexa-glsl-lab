float cm03Field(vec2 p,float t){float h=sin(p.x*2.+t*.1)+.6*cos(p.y*3.)+.35*sin((p.x+p.y)*5.);return abs(fract(h*2.)-.5);}

void mainImage(out vec4 fragColor,in vec2 fragCoord){vec2 cm03p=(fragCoord-.5*iResolution.xy)/iResolution.y*2.2;float cm03a=cm03Field(cm03p,iTime);float cm03b=cm03Field(mat2(.8,-.6,.6,.8)*cm03p*1.17,-iTime*.73);float cm03cross=smoothstep(.18,.01,abs(cm03a-cm03b));vec3 cm03col=mix(uColInk,uColPaper,.5+.5*sin(cm03a*5.));cm03col=mix(cm03col,uColSignal,cm03cross);cm03col=mix(uColBg,cm03col,smoothstep(.02,.75,abs(cm03a)+abs(cm03b)));fragColor=vec4(cm03col,1.);}
