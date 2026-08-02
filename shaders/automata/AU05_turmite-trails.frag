float au05Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au05At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au05At(uv);
  if(iFrame==0){float checker=mod(floor(fragCoord.x/8.0)+floor(fragCoord.y/8.0),2.0);state=vec4(checker*.15,0.0,0.0,1.0); return;}
  vec4 n=au05At(uv+vec2(0.0,px.y)),s=au05At(uv-vec2(0.0,px.y));
  vec4 e=au05At(uv+vec2(px.x,0.0)),w=au05At(uv-vec2(px.x,0.0));
  vec4 ne=au05At(uv+px),nw=au05At(uv+vec2(-px.x,px.y));
  vec4 se=au05At(uv+vec2(px.x,-px.y)),sw=au05At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  vec2 cell=floor(fragCoord/4.0);float cursor=step(.965,cos(cell.x*.37+float(iFrame)*.11)*cos(cell.y*.29-float(iFrame)*.07));float turn=step(.5,prev.r);float trail=max(prev.r*.985,cursor);float heading=fract(prev.g+(.007+.013*turn));state=vec4(trail,heading,cursor,max(prev.a*.99,cursor));
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
