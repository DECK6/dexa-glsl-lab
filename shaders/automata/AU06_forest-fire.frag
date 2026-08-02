float au06Hash(vec2 p){return fract(sin(dot(p+uSeed,vec2(127.1,311.7)))*43758.5453);}
vec4 au06At(vec2 uv){return texture(iChannel0,clamp(uv,0.0,1.0));}

void mainBuffer(out vec4 state,in vec2 fragCoord){
  vec2 uv=fragCoord/iResolution.xy;
  vec2 px=1.0/iChannelResolution[0].xy;
  vec4 prev=au06At(uv);
  if(iFrame==0){vec2 cell=floor(fragCoord/3.0);float tree=step(.34,au06Hash(cell));state=vec4(tree,0.0,0.0,1.0); return;}
  vec4 n=au06At(uv+vec2(0.0,px.y)),s=au06At(uv-vec2(0.0,px.y));
  vec4 e=au06At(uv+vec2(px.x,0.0)),w=au06At(uv-vec2(px.x,0.0));
  vec4 ne=au06At(uv+px),nw=au06At(uv+vec2(-px.x,px.y));
  vec4 se=au06At(uv+vec2(px.x,-px.y)),sw=au06At(uv-px);
  vec4 avg=(n+s+e+w+ne+nw+se+sw)/8.0;
  vec4 lap=n+s+e+w-4.0*prev;
  float fire=max(max(n.g,s.g),max(e.g,w.g));float lightning=step(.9993,au06Hash(floor(fragCoord)+float(iFrame)));float ignite=prev.r*step(.5,max(fire,lightning));float regrow=(1.0-prev.r)*(1.0-prev.g)*step(.995,au06Hash(floor(fragCoord)-float(iFrame)*.17));float tree=clamp(prev.r-ignite+regrow,0.0,1.0);state=vec4(tree,ignite,max(prev.b*.96,ignite),1.0);
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
