const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.APPLY_THEME || './apply_theme.js');

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
pres.defineSlideMaster({title:'Dark', background:{color:NAVY}, objects:[]});
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


// ===== Power and energy section (Michael), built from leepr's Ironwood energy model, snapshot 24 Oct 2026 =====
const arrow=(s,x,y,w,h,c,dash)=>s.addShape(pres.shapes.LINE,{x,y,w,h,line:Object.assign({color:c,width:2,endArrowType:'triangle'},dash?{dashType:dash}:{})});
const box=(s,x,y,w,h,fill,txt,col,o={})=>{rect(s,x,y,w,h,fill,{objectName:o.name||txt});
  s.addText(txt,tb({x:x+0.08,y,w:w-0.16,h,fontSize:o.fs||13,bold:true,color:col,align:'center',valign:'middle'}));};
const MID='4A78AD';

// ---- P1: scale and phasing
let s=pres.addSlide({masterName:'Content'});
s.addText('Phase 1 equals 7% of PJM\'s capacity shortfall and the full campus 29%, so Ironwood should connect in phases',{placeholder:'title'});
unit(s,0.6,1.75,7.9,'Megawatts, PJM 2028/29 capacity auction');
{ const rows=[['PJM shortfall, 2028/29',6831,GREY],['Full Ironwood campus',2000,MID],['Phase 1',480,NAVY]];
  const x0=3.25, maxW=3.9, maxV=6831;
  rows.forEach((r,i)=>{const y=2.45+i*1.2, w=Math.max(0.06,r[1]/maxV*maxW);
    s.addText(r[0],tb({x:0.6,y:y+0.1,w:2.5,h:0.4,fontSize:14,bold:i===2}));
    rect(s,x0,y,w,0.6,r[2],{objectName:'Bar '+r[0]});
    s.addText(r[1].toLocaleString('en-US')+' MW',tb({x:x0+w+0.12,y:y+0.13,w:1.4,h:0.35,fontSize:14,bold:true}));});
  vline(s,x0,2.3,3.55,GREY,1); }
panel(s,8.75,1.75,3.98,4.65,'',[
  'Phase 1 alone adds about $57M a year in capacity charges at today\'s auction price',
  'Data centers drove $29.4B, or 46%, of PJM capacity charges over the last four auctions',
  'KGE can serve 480 MW after upgrades but cannot yet time or price 2,000 MW',
  'Each later phase waits for new PJM supply and a clean step on track']);
src(s,'Source: PJM 2028/29 Base Residual Auction report; PJM Independent Market Monitor, 27 July 2026; case packet; SLAM analysis (leepr)');
s.addNotes('Start with scale. Phase 1 is 480 MW, about 7% of the capacity PJM could not find in its last auction. The full campus would be 29% of that gap, and households already pay for it, since data centers drove 46% of capacity charges in the last four auctions. So we commit to phase 1 now and build later phases only when PJM adds supply and the clean step is on track.');

// ---- P2: options on cost
s=pres.addSlide({masterName:'Content'});
s.addText('The hybrid is the only option that meets the 2035 clean step and rides through PJM emergencies, for $20 more per MWh',{placeholder:'title'});
unit(s,0.6,1.75,7.9,'Phase 1 energy cost, $ per MWh, 480 MW');
{ const bars=[['Grid only',93.6,GREY],['Onsite gas',67.1,GREY],['Clean contracts only',103.3,GREY],['Grid + battery only',103.9,GREY],['Hybrid: battery + clean contracts',113.6,NAVY]];
  const base=5.85, top=2.55, maxV=120, sc=(base-top)/maxV, bw=1.0, step=1.55, x0=0.9;
  bars.forEach((b,i)=>{const h=b[1]*sc, x=x0+i*step;
    rect(s,x,base-h,bw,h,b[2],{objectName:'Bar '+b[0]});
    s.addText('$'+b[1].toFixed(1),tb({x:x-0.25,y:base-h-0.38,w:bw+0.5,h:0.32,fontSize:14,bold:true,align:'center'}));
    s.addText(b[0],tb({x:x-0.3,y:base+0.1,w:bw+0.6,h:0.5,fontSize:12,color:i===4?INK:SLATE,bold:i===4,align:'center'}));});
  hline(s,0.6,base,7.9,GREY,1); }
panel(s,8.75,1.75,3.98,4.65,'',[
  'Costs about $84M a year more than grid only, paid by the customer under its 20-year contract',
  'Cuts CO2 by 32%, about 365,000 t a year',
  'Meets the 32% clean firm step the state sets for 2035',
  'Battery income from PJM\'s energy and reserve markets is upside we did not count']);
src(s,'Source: EIA; PJM 2028/29 auction and 2025 State of the Market; LevelTen PPA index; NREL 2025 battery costs; EPA eGRID2023; PA GRID Standards; SLAM analysis (leepr)');
s.addNotes('These are the supply options the case lists, priced per MWh for phase 1. Grid only is $93.60. The hybrid adds clean energy contracts for the state\'s 32% clean step and a 4-hour battery for grid emergencies, which brings it to $113.60. The customer asked for reliable power and progress on its carbon goals, so the $84M a year premium sits in its 20-year power contract rather than on households.');

// ---- P3: why not gas
s=pres.addSlide({masterName:'Content'});
s.addText('Onsite gas looks cheapest, yet it emits 62% more CO2 than the grid and loses its edge if gas prices climb',{placeholder:'title'});
const mini=(x,w,u,bars,maxV,fmt)=>{unit(s,x,1.75,w,u);
  const base=5.3, top=2.55, sc=(base-top)/maxV, n=bars.length, step=w/n, bw=Math.min(1.05,step*0.6);
  bars.forEach((b,i)=>{const h=b[1]*sc, bx=x+i*step+(step-bw)/2;
    rect(s,bx,base-h,bw,h,b[2],{objectName:'Bar '+b[0]});
    s.addText(fmt(b[1]),tb({x:bx-0.3,y:base-h-0.38,w:bw+0.6,h:0.32,fontSize:14,bold:true,align:'center'}));
    s.addText(b[0],tb({x:x+i*step+0.05,y:base+0.1,w:step-0.1,h:0.5,fontSize:12,color:SLATE,align:'center'}));});
  hline(s,x,base,w,GREY,1);};
mini(0.6,6.6,'Phase 1 energy cost, $ per MWh',[['Gas at forecast price',67.1,GREY],['Gas at 2024 PA industrial price',111.7,NAVY],['Grid only',93.6,GREY],['Hybrid',113.6,GREY]],125,v=>'$'+v.toFixed(1));
mini(7.75,4.98,'CO2, million t a year',[['Onsite gas',1.85,NAVY],['Grid only',1.14,GREY],['Hybrid',0.77,GREY]],2.0,v=>v.toFixed(2));
vline(s,7.45,1.8,4.2,LINE,0.75);
s.addText('Residents near the site asked for enforceable limits on generator emissions, and gas engines would run every hour of every day.',tb({x:0.6,y:6.12,w:12.1,h:0.4,fontSize:14,color:INK}));
src(s,'Source: EIA capital cost report (AEO2020) and Short-Term Energy Outlook; EIA Pennsylvania industrial gas price, 2024; EPA eGRID2023 RFC East; case packet; SLAM analysis (leepr)');
s.addNotes('Gas is the obvious objection, so we answer it directly. At the forecast gas price, onsite engines cost $67 per MWh. At the price Pennsylvania industrial users actually paid in 2024, the same plant costs $112, about what the hybrid costs. Gas also emits 62% more CO2 than the grid, fails the 2035 clean step, and puts engines next to the homes that asked for emission limits.');

// ---- P4: how the battery works
s=pres.addSlide({masterName:'Content'});
s.addText('A 4-hour battery keeps Ironwood\'s critical servers running through every PJM emergency its zone saw last summer',{placeholder:'title'});
const col3=(x,head,gridTxt,gridOn,batTxt,batOn,serverTxt)=>{const w=2.55, bw=2.25, bx=x+(w-bw)/2, cx=x+w/2;
  s.addText(head,tb({x,y:1.75,w,h:0.55,fontSize:14,bold:true,align:'center',valign:'bottom'}));
  box(s,bx,2.45,bw,0.65,gridOn?PANEL:'F4F6F8','PJM grid',gridOn?INK:MUTE);
  arrow(s,cx,3.1,0,0.7,gridOn?NAVY:GREY,gridOn?null:'dash');
  s.addText(gridTxt,tb({x:cx+0.12,y:3.28,w:1.1,h:0.32,fontSize:13,bold:true,color:gridOn?NAVY:MUTE}));
  box(s,bx,3.8,bw,0.75,NAVY,serverTxt,'FFFFFF',{fs:12});
  s.addShape(pres.shapes.LINE,{x:cx,y:4.55,w:0,h:0.7,line:{color:batOn?MID:GREY,width:2,beginArrowType:'triangle',dashType:batOn?'solid':'dash'}});
  s.addText(batTxt,tb({x:cx+0.12,y:4.73,w:1.2,h:0.32,fontSize:13,bold:true,color:batOn?MID:MUTE}));
  box(s,bx,5.25,bw,0.65,batOn?'DCE6F1':'F4F6F8','Battery, 1,920 MWh',batOn?INK:MUTE);};
col3(0.6,'Normal hours','480 MW',true,'Idle',false,'All servers, 480 MW');
col3(3.25,'Emergency, first 4 hours','0 MW',false,'480 MW',true,'All servers, 480 MW');
col3(5.9,'Emergency, hours 5 to 8','0 MW',false,'240 MW',true,'Critical servers, 240 MW');
vline(s,3.17,1.85,4.1,LINE,0.75); vline(s,5.82,1.85,4.1,LINE,0.75);
panel(s,8.75,1.75,3.98,4.65,'',[
  'PJM\'s 2025 emergencies in the Met-Ed zone lasted 3.2 to 7 hours',
  'The battery carries the whole campus for 4 hours, or the critical half for 8',
  'Only flexible AI training pauses after hour 4, a limit we write into the contract',
  'PJM gets 480 MW back in the hours it is short']);
src(s,'Source: PJM demand response event report, December 2025; Duke University Nicholas Institute, Rethinking Load Growth (2025); case packet; SLAM analysis (leepr)');
s.addNotes('This settles the case\'s hardest conflict. PJM wants the campus to cut load in an emergency, and the customer says continuous operation is essential. The battery lets Ironwood drop its grid draw to zero while it keeps running. Last summer PJM\'s emergencies in this zone lasted 3 to 7 hours. The battery covers the whole campus for 4 hours, or the critical half for 8, so only flexible training jobs ever pause, and that limit goes in the contract.');

// ---- P5: who pays
s=pres.addSlide({masterName:'Content'});
s.addText('Ironwood pays for every grid upgrade it causes, so Met-Ed households and the 600-person plant do not',{placeholder:'title'});
{ const H=(t)=>({text:t,options:{bold:true,color:SLATE,fontSize:12,border:[{type:'none'},{type:'none'},{type:'solid',pt:1.25,color:INK},{type:'none'}]}});
  const C=(t,b)=>({text:t,options:{fontSize:13,bold:!!b,color:INK,border:[{type:'none'},{type:'none'},{type:'solid',pt:0.75,color:LINE},{type:'none'}]}});
  const rows=[
   ['Substation and lines built only for Ironwood','Slate Ridge, up front','Paid before construction, under the PUC\'s "but for" rule'],
   ['Risk the load never arrives','Slate Ridge','A minimum bill of 80% of contracted demand, backed by collateral'],
   ['Leaving early or shrinking','Slate Ridge','An exit fee covering unrecovered costs or remaining minimum charges'],
   ['Clean energy for the 2035 step','The anchor customer','Contracts for 32% clean firm power, 1,346 GWh a year by 2035'],
   ['Strain on PJM in emergencies','Ironwood','The battery takes 480 MW off the grid in those hours']];
  s.addTable([[H('Cost or risk'),H('Who pays'),H('How it is enforced')],...rows.map(r=>[C(r[0],true),C(r[1]),C(r[2])])],
   {x:0.6,y:1.75,w:12.13,colW:[3.9,2.4,5.83],rowH:[0.45,0.68,0.68,0.68,0.68,0.68],fontFace:BODY,valign:'middle',margin:[0.05,0.12,0.05,0.12],objectName:'Who pays table'}); }
rect(s,0.6,5.75,12.13,0.62,PANEL,{objectName:'Commitment line'});
s.addText('The PUC\'s model tariff is guidance that utilities may adopt. KGE would sign its terms with Met-Ed anyway, in writing.',tb({x:0.85,y:5.75,w:11.7,h:0.62,fontSize:14,bold:true,color:NAVY,valign:'middle'}));
src(s,'Source: PA PUC Large Load Model Tariff final order, 13 May 2026 (M-2025-3054271); PA GRID Standards; Met-Ed tariff service territory; case packet; SLAM analysis (leepr)');
s.addNotes('The case asks who pays if demand projections change. Pennsylvania\'s model tariff answers most of it: a large load pays for upgrades built because of it, keeps paying 80% of its contracted demand even if it uses less, posts collateral, and pays an exit fee if it leaves. The tariff is only guidance, so utilities do not have to use it. We would have KGE sign those terms with Met-Ed anyway, which keeps the cost off households and the 600-person manufacturer.');

// ---- Appendix A: premium sensitivity
s=pres.addSlide({masterName:'Content'});
s.addText('Across every input range we tested, the hybrid costs between $11 and $25 more per MWh than grid power',{placeholder:'title'});
unit(s,0.6,1.75,12,'Hybrid premium over grid only, $ per MWh, when one input moves to its low or high end');
{ const rows=[['Wholesale power price','$33.74 to $74.06 per MWh',25.46,12.55],['Battery cost','$207 to $365 per kWh',10.94,22.23],['Solar PPA price','$52.65 to $83.79 per MWh',10.94,20.90],['PJM capacity price','$270 to $333 per MW-day',22.31,19.67],['Retail grid price','$85.10 to $110.40 per MWh',20.02,20.02]];
  const X0=5.6, sc=0.3, vmin=6, base=20.02, px=v=>X0+(v-vmin)*sc, top=2.35;
  vline(s,px(base),top-0.1,3.9,INK,1.25); s.addText('Base case $20.02',tb({x:px(base)-1.0,y:6.18,w:2.0,h:0.25,fontSize:11,bold:true,align:'center'}));
  rows.forEach((r,i)=>{const y=top+i*0.74, lo=Math.min(r[2],r[3]), hi=Math.max(r[2],r[3]);
    s.addText([{text:r[0],options:{bold:true,breakLine:true}},{text:r[1],options:{color:SLATE,fontSize:11}}],tb({x:0.6,y:y-0.02,w:4.8,h:0.55,fontSize:13}));
    if(hi-lo<0.05){s.addText('Moves both options equally',tb({x:px(base)+0.15,y:y+0.1,w:4,h:0.3,fontSize:12,color:SLATE}));return;}
    if(lo<base) rect(s,px(lo),y+0.05,px(base)-px(lo),0.4,MID,{objectName:'Lower '+(i+1)});
    if(hi>base) rect(s,px(base),y+0.05,px(hi)-px(base),0.4,NAVY,{objectName:'Higher '+(i+1)});
    const f=v=>'$'+v.toFixed(2);
    s.addText(f(lo),tb({x:px(lo)-1.05,y:y+0.1,w:1.0,h:0.3,fontSize:12,bold:true,align:'right'}));
    s.addText(f(hi),tb({x:px(hi)+0.08,y:y+0.1,w:1.0,h:0.3,fontSize:12,bold:true}));}); }
src(s,'Source: SLAM analysis (leepr); input ranges from PJM, LevelTen, NREL and EIA');
s.addNotes('Use this if a judge asks how sure we are. Grid price moves grid power and the hybrid by the same amount, so the gap between them does not change. The premium only moves with the wholesale price, the battery cost, the clean contract price and the capacity price, and it stays between about $11 and $25 per MWh.');

// ---- Appendix B: inputs and sources
s=pres.addSlide({masterName:'Content'});
s.addText('Every power input comes from a public source and carries a tested range',{placeholder:'title'});
{ const H=(t)=>({text:t,options:{bold:true,color:SLATE,fontSize:12,border:[{type:'none'},{type:'none'},{type:'solid',pt:1.25,color:INK},{type:'none'}]}});
  const C=(t,b)=>({text:t,options:{fontSize:12,bold:!!b,color:INK,border:[{type:'none'},{type:'none'},{type:'solid',pt:0.75,color:LINE},{type:'none'}]}});
  const rows=[
   ['Retail grid price','$93.60 per MWh','$85.10 to $110.40','EIA, Pennsylvania industrial retail sales'],
   ['PJM capacity price','$325 per MW-day','$270 to $333','PJM 2028/29 Base Residual Auction'],
   ['Wholesale energy price','$50.73 per MWh','$33.74 to $74.06','PJM 2025 State of the Market'],
   ['Clean contract (solar PPA) price','$81.03 per MWh','$52.65 to $83.79','LevelTen PPA index, Q4 2025'],
   ['Clean firm share by 2035','32%','10% in 2027, 14.5% in 2030','PA GRID Standards'],
   ['Grid CO2 intensity','597 lb per MWh','Up to 1,176 for marginal plants','EPA eGRID2023, RFC East'],
   ['Battery cost','$334 per kWh','$207 to $365','NREL 2025 battery cost update'],
   ['Battery duration','4 hours','Met-Ed and PPL zone events ran 3.2 to 7 hours in 2025','PJM demand response event report, Dec 2025'],
   ['Gas price','$3.48 per MMBtu','$3.16 to $8.86','EIA Short-Term Energy Outlook; EIA PA industrial, 2024'],
   ['Gas engine plant cost','$1,810 per kW','$1,700 to $2,400','EIA capital cost report (AEO2020)']];
  s.addTable([[H('Input'),H('Value used'),H('Range tested'),H('Source')],...rows.map(r=>[C(r[0],true),C(r[1]),C(r[2]),C(r[3])])],
   {x:0.6,y:1.75,w:12.13,colW:[2.9,1.8,3.6,3.83],rowH:0.42,fontFace:BODY,valign:'middle',margin:[0.04,0.1,0.04,0.1],objectName:'Inputs table'}); }
src(s,'Source: leepr data file data/cases/ironwood-energy.json, each input with its link and date checked');
s.addNotes('Every number in the power section traces to this table. The model and its sources are in the leepr repository, so any figure can be checked live.');

(async()=>{await pres.writeFile({fileName:'SLAM-Power-Section.pptx'});await applyTheme('SLAM-Power-Section.pptx',THEME);console.log('built');})();
