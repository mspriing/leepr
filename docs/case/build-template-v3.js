const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.APPLY_THEME || '/root/.claude/skills/synced/aba78445-e560-43cf-86ae-ebe830bbf318_d1ad3207-2975-4fef-9b14-ce540f5d6f88/pptx/scripts/apply_theme.js');

// One blue family plus greys. Navy marks the data that proves the headline; everything else is grey.
const NAVY='12294A', INK='1E2329', SLATE='56606B', MUTE='8B939B', GREY='BAC1C8', LIGHT='DADEE2', LINE='DADEE2';
const GROUND='FFFFFF', PANEL='EEF2F7', AMBER=NAVY, AMBERT='E2E9F2', POS='4A78AD', NEG='A9BCD3', ONDARK='B8C4D3';
const HEAD='Arial', BODY='Arial';
const W=13.333;
const THEME={name:'SLAM Consulting', headFontFace:HEAD, bodyFontFace:BODY,
  colors:{dk1:INK,lt1:'FFFFFF',dk2:NAVY,lt2:PANEL,accent1:NAVY,accent2:'4A78AD',accent3:GREY,accent4:POS,accent5:NEG,accent6:SLATE,hlink:NAVY,folHlink:SLATE}};

const pres=new pptxgen();
pres.layout='LAYOUT_WIDE';
pres.theme={headFontFace:HEAD, bodyFontFace:BODY};
pres.title='Ironwood Data Center | SLAM Consulting';
pres.author='SLAM Consulting';

pres.defineSlideMaster({title:'Title', background:{color:NAVY}, objects:[
  {placeholder:{options:{name:'title',type:'title',x:0.8,y:2.35,w:11.2,h:1.4,fontFace:HEAD,fontSize:44,bold:true,color:'FFFFFF',valign:'bottom',align:'left',margin:0},text:'Title'}},
  {placeholder:{options:{name:'subtitle',type:'body',x:0.8,y:3.95,w:11.2,h:0.7,fontFace:BODY,fontSize:20,color:ONDARK,valign:'top',align:'left',margin:0},text:'Subtitle'}},
]});
pres.defineSlideMaster({title:'Content', background:{color:GROUND}, objects:[
  {placeholder:{options:{name:'title',type:'title',x:0.6,y:0.5,w:10.7,h:1.0,fontFace:HEAD,fontSize:22,bold:true,color:INK,valign:'top',align:'left',margin:0},text:'Action title'}},
  {text:{text:'SLAM Consulting',options:{x:0.6,y:7.02,w:4,h:0.25,fontFace:BODY,fontSize:9,bold:true,color:MUTE,margin:0}}},
], slideNumber:{x:12.33,y:7.02,w:0.4,h:0.25,fontFace:BODY,fontSize:9,color:MUTE,align:'right',margin:0}});

const tb=(o)=>Object.assign({isTextBox:true,margin:0,fontFace:BODY,color:INK,valign:'top'},o);
const rect=(s,x,y,w,h,fill,o={})=>s.addShape(pres.shapes.RECTANGLE,Object.assign({x,y,w,h,fill:{color:fill},line:{type:'none'}},o));
const hline=(s,x,y,w,c=LINE,wt=0.75,dash)=>s.addShape(pres.shapes.LINE,{x,y,w,h:0,line:Object.assign({color:c,width:wt},dash?{dashType:dash}:{})});
const vline=(s,x,y,h,c=LINE,wt=0.75,dash)=>s.addShape(pres.shapes.LINE,{x,y,w:0,h,line:Object.assign({color:c,width:wt},dash?{dashType:dash}:{})});
const src=(s,t)=>s.addText(t,tb({x:0.6,y:6.62,w:11.5,h:0.25,fontSize:9,color:MUTE,objectName:'Source'}));
const unit=(s,x,y,w,t)=>s.addText(t,tb({x,y,w,h:0.3,fontSize:12,color:SLATE,objectName:'Unit line'}));
const sticker=(s,t)=>s.addText(t,tb({x:11.4,y:0.55,w:1.33,h:0.3,fontSize:11,italic:true,color:MUTE,align:'right',objectName:'Sticker'}));
const panel=(s,x,y,w,h,head,items,o={})=>{
  rect(s,x,y,w,h,PANEL,{objectName:'Takeaway panel'});
  s.addText(items.map((t,i)=>({text:t,options:{bullet:{indent:14},breakLine:i<items.length-1}})),tb({x:x+0.3,y:y+0.35,w:w-0.6,h:h-0.6,fontSize:o.fs||14,color:INK,paraSpaceAfter:10}));
};
const harvey=(s,cx,cy,d,level)=>{ // level 0..4
  s.addShape(pres.shapes.OVAL,{x:cx-d/2,y:cy-d/2,w:d,h:d,fill:{color:'FFFFFF'},line:{color:NAVY,width:1}});
  if(level>=4) s.addShape(pres.shapes.OVAL,{x:cx-d/2,y:cy-d/2,w:d,h:d,fill:{color:NAVY},line:{color:NAVY,width:1}});
  else if(level>0) s.addShape(pres.shapes.PIE,{x:cx-d/2,y:cy-d/2,w:d,h:d,fill:{color:NAVY},line:{color:NAVY,width:1},angleRange:[270,270+90*level]});
};

// ---------- 1 Title
let s=pres.addSlide({masterName:'Title'});
s.addText('Ironwood Data Center',{placeholder:'title'});
s.addText('A recommendation to KGE leadership',{placeholder:'subtitle'});
s.addText('SLAM Consulting  |  [Name], [Name], [Name], [Name]  |  October 2026',tb({x:0.8,y:6.3,w:11.7,h:0.4,fontSize:14,color:ONDARK}));
s.addNotes('Open with the firm name and the decision KGE faces, then introduce each presenter and the part they cover. Keep this under thirty seconds.');

// ---------- 2 Executive summary
s=pres.addSlide({masterName:'Content'});
s.addText('[Recommendation in one sentence and the reason that wins it]',{placeholder:'title'});
rect(s,0.6,1.75,4.3,4.65,NAVY,{objectName:'Answer box'});
s.addText('[What KGE should do, stated as one decision]',tb({x:0.95,y:2.1,w:3.6,h:2.8,fontSize:24,bold:true,color:'FFFFFF'}));
hline(s,0.95,5.25,3.6,'2E4566');
s.addText('[The first step KGE approves today and when it happens]',tb({x:0.95,y:5.4,w:3.6,h:0.8,fontSize:13,color:ONDARK}));
[['Returns','[IRR against the 10% hurdle and what drives it]'],
 ['Power','[Supply option, cost per MWh and first-power year]'],
 ['Community','[Who carries the cost and what KGE commits to]'],
 ['Risk','[Largest risk and how the plan contains it]']].forEach((r,i)=>{const y=1.75+i*1.16;
  if(i>0) hline(s,5.35,y,7.38);
  s.addText(r[0],tb({x:5.35,y:y+0.28,w:1.9,h:0.4,fontSize:15,bold:true,color:NAVY}));
  s.addText(r[1],tb({x:7.35,y:y+0.28,w:5.38,h:0.8,fontSize:15,color:INK}));});
s.addNotes('Answer first. The judges should know what KGE should do and why before any analysis. Every number here must match the section it comes from.');

// ---------- Agenda tracker
const PARTS=[['Recommendation and situation','[Presenter]','3 min'],['Financial case','[Presenter]','5 min'],['Power and energy','[Presenter]','5 min'],['Community, risk and plan','[Presenter]','5 min']];
const tracker=(cur,note)=>{const t=pres.addSlide({masterName:'Content'});
  t.addText('Agenda',{placeholder:'title'});
  PARTS.forEach((p,i)=>{const y=1.85+i*1.05, on=i===cur;
    if(on) rect(t,0.6,y,12.13,1.05,AMBERT,{objectName:'Current section'});
    hline(t,0.6,y,12.13,LINE,0.75);
    t.addText(String(i+1),tb({x:0.9,y:y+0.3,w:0.6,h:0.5,fontSize:22,bold:true,color:on?NAVY:GREY}));
    t.addText(p[0],tb({x:1.7,y:y+0.33,w:6.5,h:0.45,fontSize:20,bold:on,color:on?INK:MUTE}));
    t.addText(p[1],tb({x:8.4,y:y+0.37,w:2.6,h:0.4,fontSize:14,color:on?SLATE:GREY}));
    t.addText(p[2],tb({x:11.2,y:y+0.37,w:1.33,h:0.4,fontSize:14,color:on?SLATE:GREY,align:'right'}));});
  hline(t,0.6,1.85+4*1.05,12.13);
  t.addNotes(note);};
tracker(0,'Use this page as the agenda and as the handoff between presenters. The shaded row moves to the next section each time it appears.');

// ---------- Situation: inside-out / outside-in
s=pres.addSlide({masterName:'Content'});
s.addText('[Headline on why KGE has to decide now]',{placeholder:'title'});
const col=(x,w,head,sub,items)=>{
  s.addText(head,tb({x,y:1.85,w,h:0.55,fontSize:15,bold:true,color:NAVY,valign:'bottom'}));
  hline(s,x,2.5,w,INK,1.25);
  items.forEach((it,i)=>{const y=2.5+i*1.25; if(i>0) hline(s,x,y,w);
    s.addText(it,tb({x,y:y+0.2,w,h:0.9,fontSize:14,color:INK}));});};
col(0.6,3.9,'What the grid and the state are doing','',
  ['PJM fell 6,831 MW short of its reliability target in the 2028/29 auction','Data centers drove 46% of PJM capacity charges over the last four auctions','Pennsylvania requires 32% clean firm energy by 2035']);
col(8.83,3.9,'What Ironwood does to the region','',
  ['[Grid upgrade costs and who pays them]','[Land, water and noise for nearby residents]','[Jobs and tax base for the township]']);
rect(s,4.95,2.5,3.43,3.75,NAVY,{objectName:'Overlap box'});
s.addText('[The tension this recommendation resolves, in one sentence]',tb({x:5.2,y:2.8,w:2.93,h:3.2,fontSize:20,bold:true,color:'FFFFFF'}));
src(s,'Source: PJM 2028/29 Base Residual Auction; PJM Independent Market Monitor, July 2026; PA GRID Standards; SLAM analysis');
s.addNotes('The left column lists what the grid and the state are doing to Ironwood. The right column lists what Ironwood does to the people around it. The navy box names the one issue where the two collide, which is the problem the recommendation solves. Skip any recap the judges could recite back from the case.');

// ---------- Options matrix
s=pres.addSlide({masterName:'Content'});
s.addText('[Headline naming the winning option and the criterion that decides it]',{placeholder:'title'});
sticker(s,'Illustrative');
const crit=['Return vs 10% hurdle','Speed to power','Emissions','Community burden','Legal and policy risk','Overall'];
const opts=[['Grid only','The base plan',[2,1,2,2,2,2]],['Onsite gas','Engines on site',[3,4,0,1,1,1]],['Hybrid design','Battery plus clean contracts',[2,3,4,3,3,4]],['[Defer or relocate]','[Fourth option]',[1,0,2,4,2,1]]];
const cx0=4.35, cw=1.4;
crit.forEach((c,j)=>s.addText(c,tb({x:cx0+j*cw,y:1.75,w:cw,h:0.6,fontSize:12,bold:true,color:SLATE,align:'center',valign:'bottom'})));
hline(s,0.6,2.45,12.13,INK,1.25);
opts.forEach((o,i)=>{const y=2.45+i*0.95; const hi=i===2;
  if(hi) rect(s,0.6,y,12.13,0.95,AMBERT,{objectName:'Recommended row'});
  if(i>0) hline(s,0.6,y,12.13);
  s.addText(o[0],tb({x:0.8,y:y+0.17,w:3.4,h:0.35,fontSize:15,bold:true,color:INK}));
  s.addText(o[1],tb({x:0.8,y:y+0.52,w:3.4,h:0.3,fontSize:12,color:MUTE}));
  o[2].forEach((lv,j)=>harvey(s,cx0+j*cw+cw/2,y+0.475,0.36,lv));});
hline(s,0.6,2.45+4*0.95,12.13);
vline(s,cx0+5*cw-0.02,1.9,4.35,LIGHT);
[[4,'Strongest'],[2,'Partial'],[0,'Weakest']].forEach((l,k)=>{const x=0.6+k*1.75; harvey(s,x+0.11,6.38,0.22,l[0]); s.addText(l[1],tb({x:x+0.32,y:6.28,w:1.3,h:0.25,fontSize:11,color:SLATE}));});
s.addText('Shading marks the recommended option',tb({x:6.2,y:6.28,w:6.53,h:0.25,fontSize:11,color:SLATE,align:'right'}));
src(s,'Source: Case packet; SLAM analysis');
s.addNotes('Score each option on the same criteria the rest of the deck uses. Speed and emissions come from the power analysis. Gas connects in about 2.5 years, the hybrid in 3 and grid only in 4. The hybrid is the only option that meets the 2035 clean step. Move the shading if the team recommends a different option.');

// ---------- Financials
tracker(1,'Hand off to the presenter covering returns.');
s=pres.addSlide({masterName:'Content'});
s.addText('[Headline saying whether the recommended option clears KGE\'s 10% hurdle]',{placeholder:'title'});
sticker(s,'Illustrative');
unit(s,0.6,1.75,7.6,'Project IRR by option, %, 20-year life');
{ const base=5.9, top=2.55, maxV=14, bars=[['Grid only',11.0,GREY],['Onsite gas',12.2,GREY],['Hybrid design',10.8,AMBER],['[Fourth option]',7.0,GREY]];
  const y10=base-(10/maxV)*(base-top);
  bars.forEach((b,i)=>{const h=(b[1]/maxV)*(base-top), x=1.0+i*1.85;
    rect(s,x,base-h,1.15,h,b[2],{objectName:'Bar '+b[0]});
    s.addText('[ %]',tb({x:x-0.2,y:base-h-0.4,w:1.55,h:0.32,fontSize:14,bold:true,align:'center'}));
    s.addText(b[0],tb({x:x-0.3,y:base+0.1,w:1.75,h:0.3,fontSize:12,color:SLATE,align:'center'}));});
  hline(s,0.6,base,7.6,GREY,1);
  hline(s,0.6,y10,7.6,NAVY,1.25,'dash');
  s.addText('KGE hurdle, 10%',tb({x:6.0,y:y10-0.33,w:2.2,h:0.28,fontSize:11,bold:true,color:NAVY,align:'right'})); }
panel(s,8.75,1.75,3.98,4.65,'What this means',['[Does the recommended option clear 10%, and by how much]','[What the extra return or cost buys KGE]','[The input that would push it below the hurdle]']);
src(s,'Source: SLAM financial model; case exhibits');
s.addNotes('Replace every bar with the team model. Keep the dashed hurdle line, since it lets the judges see the answer without reading a number. The sensitivity table in the appendix backs up the last bullet.');

s=pres.addSlide({masterName:'Content'});
s.addText('[Headline on what moves NPV from the base plan to the recommendation]',{placeholder:'title'});
sticker(s,'Illustrative');
unit(s,0.6,1.75,12,'NPV at 10%, $ millions, base plan to recommended option');
{ const steps=[['Base plan NPV',100,'tot'],['[Power cost]',25,'pos'],['[Tax abatement]',15,'pos'],['[Hybrid capex]',-30,'neg'],['[Community commitments]',-12,'neg'],['Recommended NPV',98,'tot']];
  const base=5.95, top=2.35, maxV=145, sc=(base-top)/maxV, bw=1.25, gap=0.72; let run=0;
  steps.forEach((st,i)=>{const x=0.85+i*(bw+gap); let y0,y1,c;
    if(st[2]==='tot'){y0=0;y1=st[1];run=st[1];c=NAVY;}
    else if(st[2]==='pos'){y0=run;y1=run+st[1];run=y1;c=POS;}
    else {y0=run+st[1];y1=run;run=y0;c=NEG;}
    rect(s,x,base-y1*sc,bw,(y1-y0)*sc,c,{objectName:'Step '+(i+1)});
    s.addText(st[2]==='tot'?'[$ M]':(st[2]==='pos'?'+[$ M]':'-[$ M]'),tb({x:x-0.2,y:base-y1*sc-0.36,w:bw+0.4,h:0.3,fontSize:13,bold:true,align:'center'}));
    s.addText(st[0],tb({x:x-0.3,y:base+0.1,w:bw+0.6,h:0.5,fontSize:12,color:SLATE,align:'center'}));
    if(i<steps.length-1) hline(s,x+bw,base-run*sc,gap,GREY,0.75,'dash');});
  hline(s,0.6,base,12.13,GREY,1); }
src(s,'Source: SLAM financial model');
s.addNotes('Each step is one driver of the difference between the base plan and the recommendation. Mid blue adds value and light blue takes it away. Order the steps from largest to smallest so the biggest driver reads first.');

// ---------- Power
tracker(2,'Hand off to the presenter covering power.');
s=pres.addSlide({masterName:'Content'});
s.addText('Onsite gas costs least per MWh, while only clean contracts and the hybrid meet the 2035 clean step',{placeholder:'title'});
unit(s,0.6,1.75,7.9,'Phase 1 energy cost, $ per MWh');
{ const bars=[['Grid only',93.6,GREY],['Onsite gas',67.1,GREY],['Grid + clean contracts',103.3,AMBER],['Grid + battery',103.9,GREY],['Hybrid',113.6,AMBER]];
  const base=5.95, top=2.6, maxV=120, sc=(base-top)/maxV, bw=1.05, step=1.55, x0=0.85;
  bars.forEach((b,i)=>{const h=b[1]*sc, x=x0+i*step;
    rect(s,x,base-h,bw,h,b[2],{objectName:'Bar '+b[0]});
    s.addText('$'+b[1].toFixed(1),tb({x:x-0.2,y:base-h-0.38,w:bw+0.4,h:0.32,fontSize:14,bold:true,align:'center'}));
    s.addText(b[0],tb({x:x-0.25,y:base+0.1,w:bw+0.5,h:0.5,fontSize:12,color:SLATE,align:'center'}));});
  hline(s,0.6,base,7.9,GREY,1); }
panel(s,8.75,1.75,3.98,4.65,'What this means',['Dark bars meet the 2035 clean firm step','Gas emits 62% more CO2 than the grid','Gas rises to $112 at the 2024 PA industrial gas price','The hybrid runs about 21% above grid only']);
src(s,'Source: PJM 2028/29 auction; EIA; EPA eGRID2023; NREL; PA GRID Standards; SLAM analysis');
s.addNotes('Figures are for phase 1 at 480 MW, from the Ironwood energy snapshot dated 19 October 2026. Gas looks cheapest only while the plant buys gas near the Henry Hub price. At the price Pennsylvania industrial users paid in 2024, gas costs $112 per MWh, which is above the grid.');

s=pres.addSlide({masterName:'Content'});
s.addText('Meeting the 2035 clean step costs $10 to $20 more per MWh, and of those two only the hybrid connects a year early',{placeholder:'title'});
unit(s,0.6,1.75,8.2,'Phase 1 CO2, million t a year, against cost, $ per MWh');
{ const X0=1.45, X1=8.4, Y0=5.75, Y1=2.45, xmin=60, xmax=120, ymin=0.6, ymax=2.0;
  const px=v=>X0+(v-xmin)/(xmax-xmin)*(X1-X0), py=v=>Y0-(v-ymin)/(ymax-ymin)*(Y0-Y1);
  hline(s,X0,Y0,X1-X0,GREY,1); vline(s,X0,Y1,Y0-Y1,GREY,1);
  [60,80,100,120].forEach(v=>s.addText('$'+v,tb({x:px(v)-0.4,y:Y0+0.08,w:0.8,h:0.25,fontSize:11,color:MUTE,align:'center'})));
  [0.6,1.0,1.4,1.8].forEach(v=>s.addText(v.toFixed(1),tb({x:X0-0.6,y:py(v)-0.12,w:0.5,h:0.25,fontSize:11,color:MUTE,align:'right'})));
  s.addText('Cost, $ per MWh',tb({x:X1-2.5,y:Y0+0.36,w:2.5,h:0.25,fontSize:11,color:SLATE,align:'right'}));
    hline(s,X0,py(1.14),X1-X0,LIGHT,0.75,'dash');
  s.addText('Grid average',tb({x:X1-1.6,y:py(1.14)-0.27,w:1.6,h:0.22,fontSize:10,color:MUTE,align:'right'}));
  const pts=[['Grid only','4 yrs to power',93.6,1.14,false,'l'],['Onsite gas','2.5 yrs to power',67.1,1.85,false,'r'],['Grid + clean contracts','4 yrs to power',103.3,0.77,true,'l'],['Grid + battery','3 yrs to power',103.9,1.14,false,'b'],['Hybrid','3 yrs to power',113.6,0.77,true,'t']];
  pts.forEach(p=>{const cx=px(p[2]), cy=py(p[3]), d=0.32;
    s.addShape(pres.shapes.OVAL,{x:cx-d/2,y:cy-d/2,w:d,h:d,fill:{color:p[4]?AMBER:GREY},line:{color:'FFFFFF',width:1.5},objectName:'Point '+p[0]});
    const L={r:[cx+0.25,cy-0.25,'left'],l:[cx-2.45,cy-0.25,'right'],b:[cx-1.1,cy+0.2,'center'],t:[cx-1.1,cy-0.72,'center']}[p[5]];
    s.addText([{text:p[0],options:{bold:true,breakLine:true}},{text:p[1],options:{color:SLATE}}],tb({x:L[0],y:L[1],w:2.2,h:0.5,fontSize:11,align:L[2]}));}); }
panel(s,9.05,1.75,3.68,4.65,'What this means',['Dark dots meet the 2035 clean firm step','Gas is cheapest and dirtiest at once','The hybrid buys clean power and an earlier start'],{fs:14});
src(s,'Source: EPA eGRID2023 RFC East; EIA; PJM; SLAM analysis');
s.addNotes('Each dot is one power option for phase 1. Further left is cheaper, lower is cleaner. Dark dots meet the state 2035 clean firm step. Clean contracts add about $10 per MWh and the hybrid about $20. The hybrid also connects in about three years instead of four.');

// ---------- Community, risk and plan
tracker(3,'Hand off to the presenter covering community, risk and the plan.');
s=pres.addSlide({masterName:'Content'});
s.addText('[Headline on who carries the cost and what KGE commits to in return]',{placeholder:'title'});
sticker(s,'Illustrative');
{ const X0=1.1, X1=8.1, Y0=6.0, Y1=1.95, mx=(X0+X1)/2, my=(Y0+Y1)/2;
  rect(s,mx,Y1,X1-mx,my-Y1,AMBERT,{objectName:'Manage closely quadrant'});
  hline(s,X0,Y0,X1-X0,GREY,1); vline(s,X0,Y1,Y0-Y1,GREY,1);
  hline(s,X0,my,X1-X0,LIGHT,0.75,'dash'); vline(s,mx,Y1,Y0-Y1,LIGHT,0.75,'dash');
  [['Keep satisfied',X0+0.15,Y1+0.12],['Manage closely',mx+0.15,Y1+0.12],['Monitor',X0+0.15,my+0.12],['Keep informed',mx+0.15,my+0.12]].forEach(q=>s.addText(q[0],tb({x:q[1],y:q[2],w:2.5,h:0.25,fontSize:11,bold:true,color:MUTE})));
  s.addText('Impact on them',tb({x:X1-2.5,y:Y0+0.08,w:2.5,h:0.25,fontSize:11,color:SLATE,align:'right'}));
  s.addText('Influence over the decision',tb({x:0.6,y:Y1-0.38,w:3,h:0.25,fontSize:11,color:SLATE}));
  const sh=[['Township and county',0.82,0.85],['Nearby residents',0.88,0.42],['600-person manufacturer',0.7,0.6],['Ratepayers',0.62,0.22],['Anchor customer',0.35,0.88],['PJM and the utility',0.2,0.75],['State regulators',0.42,0.68]];
  sh.forEach(p=>{const cx=X0+p[1]*(X1-X0), cy=Y0-p[2]*(Y0-Y1), d=0.2, hot=p[1]>0.5&&p[2]>0.5;
    s.addShape(pres.shapes.OVAL,{x:cx-d/2,y:cy-d/2,w:d,h:d,fill:{color:hot?NAVY:GREY},line:{type:'none'}});
    s.addText(p[0],tb({x:cx+0.16,y:cy-0.13,w:2.2,h:0.26,fontSize:11,bold:hot,color:hot?INK:SLATE}));}); }
panel(s,8.75,1.75,3.98,4.65,'What KGE commits to',['[Commitment to nearby residents]','[Commitment to the manufacturer]','[Commitment on ratepayer costs]','[How KGE reports progress]']);
src(s,'Source: Case packet; public comment; SLAM analysis');
s.addNotes('Place each stakeholder by how hard the project hits them and how much say they have. The shaded corner is where the plan has to win. The panel on the right pairs each of those groups with a concrete commitment. Ethics judges reward this kind of stakeholder analysis.');

s=pres.addSlide({masterName:'Content'});
s.addText('[Headline saying the largest risk is contained and how]',{placeholder:'title'});
sticker(s,'Illustrative');
{ const gx=1.35, gy=2.05, cs=1.35, heat=[[PANEL,AMBERT,'C3D3E6'],[PANEL,AMBERT,AMBERT],[PANEL,PANEL,PANEL]];
  for(let r=0;r<3;r++) for(let c=0;c<3;c++) rect(s,gx+c*cs,gy+r*cs,cs-0.06,cs-0.06,heat[r][c]);
  ['High','Medium','Low'].forEach((t,r)=>s.addText(t,tb({x:0.55,y:gy+r*cs+0.5,w:0.75,h:0.3,fontSize:11,color:SLATE,align:'right'})));
  ['Low','Medium','High'].forEach((t,c)=>s.addText(t,tb({x:gx+c*cs,y:gy+3*cs+0.05,w:cs-0.06,h:0.3,fontSize:11,color:SLATE,align:'center'})));
  s.addText('Likelihood',tb({x:gx,y:gy+3*cs+0.35,w:3*cs,h:0.28,fontSize:11,bold:true,color:SLATE,align:'center'}));
  s.addText('Impact',tb({x:0.55,y:gy-0.38,w:1.5,h:0.28,fontSize:11,bold:true,color:SLATE}));
  const pos=[[1,0,2],[2,0,1],[3,1,1],[4,2,0]]; // id,row,col
  const off={1:[0.3,0.3],2:[0.6,0.6],3:[0.45,0.45],4:[0.45,0.45]};
  pos.forEach(p=>{const x=gx+p[2]*cs+off[p[0]][0], y=gy+p[1]*cs+off[p[0]][1];
    s.addShape(pres.shapes.OVAL,{x,y,w:0.4,h:0.4,fill:{color:NAVY},line:{color:'FFFFFF',width:1.5}});
    s.addText(String(p[0]),tb({x,y,w:0.4,h:0.4,fontSize:13,bold:true,color:'FFFFFF',align:'center',valign:'middle'}));}); }
{ const x=6.0, w=6.73; s.addText('Risk',tb({x:x+0.6,y:1.75,w:2.4,h:0.3,fontSize:12,bold:true,color:SLATE}));
  s.addText('Mitigation',tb({x:x+3.2,y:1.75,w:3.5,h:0.3,fontSize:12,bold:true,color:SLATE}));
  hline(s,x,2.12,w,INK,1.25);
  [1,2,3,4].forEach((n,i)=>{const y=2.12+i*1.07; if(i>0) hline(s,x,y,w);
    s.addShape(pres.shapes.OVAL,{x,y:y+0.3,w:0.36,h:0.36,fill:{color:NAVY},line:{type:'none'}});
    s.addText(String(n),tb({x,y:y+0.3,w:0.36,h:0.36,fontSize:12,bold:true,color:'FFFFFF',align:'center',valign:'middle'}));
    s.addText(`[Risk ${n}]`,tb({x:x+0.6,y:y+0.3,w:2.4,h:0.6,fontSize:14,bold:true}));
    s.addText('[What KGE does about it, and who owns it]',tb({x:x+3.2,y:y+0.3,w:3.53,h:0.65,fontSize:13,color:SLATE}));});
  hline(s,x,2.12+4*1.07,w); }
src(s,'Source: SLAM analysis');
s.addNotes('Place each numbered risk in the grid by likelihood and impact, then match the number on the right with its mitigation and owner. Start with the risk in the darkest cell.');

s=pres.addSlide({masterName:'Content'});
s.addText('[Headline giving the first-power date if KGE decides this quarter]',{placeholder:'title'});
sticker(s,'Illustrative');
{ const years=['2027','2028','2029','2030','2031'], gx=3.4, gw=9.33, cw=gw/5, gy=1.7;
  years.forEach((yr,i)=>s.addText(yr,tb({x:gx+i*cw,y:gy,w:cw,h:0.3,fontSize:12,bold:true,color:SLATE,align:'center'})));
  hline(s,0.6,gy+0.38,12.13,INK,1.25);
  years.forEach((yr,i)=>{if(i>0) vline(s,gx+i*cw,gy+0.38,2.95,LIGHT,0.5,'dash');});
  const RH=0.55; const ws=[['[Approvals and permits]',0,1.0,NAVY],['[Grid connection]',0.5,2.5,NAVY],['[Phase 1 construction]',1.0,2.2,NAVY],['[Community commitments]',0.2,4.8,GREY]];
  ws.forEach((w,i)=>{const y=gy+0.5+i*RH;
    s.addText(w[0],tb({x:0.6,y:y+0.08,w:2.7,h:0.35,fontSize:13}));
    rect(s,gx+w[1]*cw,y+0.1,w[2]*cw,0.32,w[3],{objectName:'Bar '+(i+1)});});
  const m=gx+3.2*cw; s.addShape(pres.shapes.DIAMOND,{x:m-0.17,y:gy+0.5+4*RH+0.04,w:0.34,h:0.34,fill:{color:AMBER},line:{type:'none'}});
  s.addText('[Phase 1 first power]',tb({x:0.6,y:gy+0.5+4*RH+0.08,w:2.7,h:0.35,fontSize:13,bold:true}));
  s.addText('[Month year]',tb({x:m+0.25,y:gy+0.5+4*RH+0.08,w:2,h:0.35,fontSize:12,bold:true,color:NAVY})); }
{ const y=5.4; s.addText('How KGE will know it is working',tb({x:0.6,y,w:6,h:0.3,fontSize:13,bold:true,color:NAVY}));
  hline(s,0.6,y+0.38,12.13,INK,1.25);
  [['[KPI]','[Target]','[By when]'],['[KPI]','[Target]','[By when]'],['[KPI]','[Target]','[By when]']].forEach((k,i)=>{const x=0.6+i*4.1;
    s.addText(k[0],tb({x,y:y+0.52,w:3.8,h:0.3,fontSize:14,bold:true}));
    s.addText(k[1]+'  |  '+k[2],tb({x,y:y+0.82,w:3.8,h:0.3,fontSize:13,color:SLATE}));}); }
src(s,'Source: Case timeline; PJM interconnection estimates; SLAM analysis');
s.addNotes('Drag each bar to the team dates and keep the diamond on first power. Choose KPIs that track the promises made earlier, such as clean energy share, ratepayer impact and first-power date.');

// ---------- Closing ask
s=pres.addSlide({masterName:'Title'});
s.addText('What we ask KGE to approve today',tb({x:0.8,y:1.55,w:11.7,h:0.9,fontSize:34,bold:true,color:'FFFFFF'}));
['[Decision one]','[Decision two]','[Decision three]'].forEach((d,i)=>{const y=2.85+i*1.05;
  hline(s,0.8,y,11.73,'2E4566');
  s.addText(d,tb({x:0.8,y:y+0.28,w:8.5,h:0.5,fontSize:22,color:'FFFFFF'}));
  s.addText('[When]',tb({x:9.6,y:y+0.32,w:2.93,h:0.45,fontSize:16,color:ONDARK,align:'right'}));});
hline(s,0.8,2.85+3*1.05,11.73,'2E4566');
s.addText('Thank you. We welcome your questions.',tb({x:0.8,y:6.35,w:8,h:0.4,fontSize:14,color:ONDARK}));
s.addNotes('Close on the decisions, in the same words as the executive summary. Use one row per decision KGE has to make, up to three.');

// ---------- Appendix
s=pres.addSlide({masterName:'Title'});
s.addText('Appendix',{placeholder:'title'});
s.addText('Backup for questions',{placeholder:'subtitle'});
s.addNotes('Only show these slides when a judge asks.');

s=pres.addSlide({masterName:'Content'});
s.addText('A higher grid price moves the hybrid\'s cost most, and a 2-hour battery would cut it most',{placeholder:'title'});
unit(s,0.6,1.75,12,'Change in hybrid cost from $113.6 per MWh when one input moves to its low or high end, $ per MWh');
{ const rows=[['Grid price rises to $110.4',16.8],['Battery covers 2 hours instead of 4',-11.9],['PPA price falls to $52.65',-9.1],['Battery cost falls to $207 per kWh',-9.1],['Wholesale price rises to $74.06',-7.5],['Battery cost rises to $365 per kWh',2.2]];
  const cx=7.6, sc=0.17;
  vline(s,cx,2.2,4.2,INK,1.25);
  rows.forEach((r,i)=>{const y=2.3+i*0.68, w=Math.abs(r[1])*sc, up=r[1]>0;
    s.addText(r[0],tb({x:0.6,y:y+0.07,w:4.3,h:0.35,fontSize:13}));
    rect(s,up?cx:cx-w,y+0.05,w,0.4,up?NAVY:POS,{objectName:'Bar '+(i+1)});
    s.addText((up?'+':'-')+'$'+Math.abs(r[1]).toFixed(1),tb({x:up?cx+w+0.1:cx-w-1.1,y:y+0.09,w:1.0,h:0.32,fontSize:13,bold:true,align:up?'left':'right'}));});
  s.addText('Cheaper',tb({x:cx-1.6,y:6.35,w:1.45,h:0.25,fontSize:11,color:SLATE,align:'right'}));
  s.addText('Costlier',tb({x:cx+0.15,y:6.35,w:1.5,h:0.25,fontSize:11,color:SLATE})); }
src(s,'Source: SLAM analysis, Ironwood energy snapshot, 19 October 2026');
s.addNotes('Use this slide if a judge asks how sure we are about the hybrid cost. The grid price is the biggest swing. The battery size is the biggest lever KGE controls, since Duke University found most grid emergencies last under about two hours.');

s=pres.addSlide({masterName:'Content'});
s.addText('Sources',{placeholder:'title'});
const L=['PJM, 2028/2029 Base Residual Auction report','PJM Independent Market Monitor, 27 July 2026','PJM, 2025 State of the Market report','EPA, eGRID2023 summary tables','Duke University, Rethinking Load Growth','PJM Board letter on large load additions, 16 January 2026'];
const R=['Pennsylvania DCED, GRID Standards','EIA, capital cost report (AEO2020)','EIA, Short-Term Energy Outlook','NREL, 2025 battery cost update','LevelTen PPA price index, Q4 2025','[Add team sources]'];
const lst=(arr)=>arr.map((t,i)=>({text:t,options:{bullet:{indent:14},breakLine:i<arr.length-1}}));
s.addText(lst(L),tb({x:0.6,y:1.8,w:5.8,h:4.5,fontSize:14,color:SLATE,paraSpaceAfter:10}));
s.addText(lst(R),tb({x:6.93,y:1.8,w:5.8,h:4.5,fontSize:14,color:SLATE,paraSpaceAfter:10}));
s.addNotes('Full links for every power source are in docs/IRONWOOD-ENERGY.md in the leepr repo.');

(async()=>{await pres.writeFile({fileName:'SLAM-Ironwood-Template-v3.pptx'});await applyTheme('SLAM-Ironwood-Template-v3.pptx',THEME);console.log('built');})();
