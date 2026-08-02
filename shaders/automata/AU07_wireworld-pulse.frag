float au07Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au07At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au07At(uv);
  if(iFrame==0){vec2 p=uv-.5;float wire=step(abs(sin(20.0*p.x)+sin(17.0*p.y)),.25);float head=wire*step(.97,au07Hash(floor(fragCoord/2.0)));state=vec4(wire,head,0.0,1.0); return;}
  vec4 n=au07At(uv+vec2(0.0,px.y)),s=au07At(uv-vec2(0.0,px.y));
  vec4 e=au07At(uv+vec2(px.x,0.0)),w=au07At(uv-vec2(px.x,0.0));
  vec4 ne=au07At(uv+px),nw=au07At(uv+vec2(-px.x,px.y));
  vec4 se=au07At(uv+vec2(px.x,-px.y)),sw=au07At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float heads=n.g+s.g+e.g+w.g+ne.g+nw.g+se.g+sw.g;float conductor=prev.r;float newHead=conductor*(1.0-prev.g)*(1.0-prev.b)*step(.5,heads)*step(heads,2.5);float tail=prev.g;state=vec4(conductor,newHead,tail,max(prev.a*.96,newHead));
}

void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec4 q=texture(iChannel0,uv);
  float grain=0.5+0.5*sin((uv.x*17.0+uv.y*23.0+iTime*0.7)*6.28318);
  vec3 col=mix(uColBg,uColDim,0.12+0.32*q.b);
  col=mix(col,uColSignal,clamp(q.r,0.0,1.0));
  col=mix(col,uColAccent,clamp(q.g,0.0,1.0)*0.72);
  col+=uColPaper*q.a*(0.08+0.08*grain);

  fragColor=vec4(col,1.0);
}
