const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.APPLY_THEME || './apply_theme.js');

const INK='1C2631', SLATE='56636F', MUTE='8A949C', LINE='D3D8DC', TINT='EEF1EF', GREEN='1F5A44', GREENL='DCE8E0', ONDARK='C5CED4', GREENDK='8FBFA6';
const HEAD='Georgia', BODY='Arial';
const THEME={name:'SLAM Consulting', headFontFace:HEAD, bodyFontFace:BODY,
  colors:{dk1:INK,lt1:'FFFFFF',dk2:'2E3A45',lt2:TINT,accent1:GREEN,accent2:SLATE,accent3:'7C8892',accent4:'A9B4AD',accent5:'3D7A62',accent6:'B9C2C8',hlink:GREEN,folHlink:SLATE}};

const pres=new pptxgen();
pres.layout='LAYOUT_WIDE';
pres.theme={headFontFace:HEAD, bodyFontFace:BODY};
pres.title='Ironwood Data Center | SLAM Consulting';
pres.author='SLAM Consulting';

const FOOT='SLAM Consulting  |  Business with Integrity Case Competition 2026';

pres.defineSlideMaster({title:'Title', background:{color:INK}, objects:[
  {placeholder:{options:{name:'title',type:'title',x:0.8,y:2.2,w:11.7,h:1.5,fontFace:HEAD,fontSize:44,color:'FFFFFF',valign:'bottom',align:'left',margin:0},text:'Presentation title'}},
  {placeholder:{options:{name:'subtitle',type:'body',x:0.8,y:3.9,w:11.7,h:0.8,fontFace:BODY,fontSize:20,color:ONDARK,valign:'top',margin:0},text:'Subtitle'}},
  {placeholder:{options:{name:'meta',type:'body',x:0.8,y:6.25,w:11.7,h:0.6,fontFace:BODY,fontSize:12,color:MUTE,valign:'bottom',margin:0},text:'Team and date'}},
]});
pres.defineSlideMaster({title:'Section', background:{color:INK}, objects:[
  {placeholder:{options:{name:'num',type:'body',x:0.8,y:2.55,w:6,h:0.5,fontFace:BODY,fontSize:16,bold:true,color:GREENDK,margin:0},text:'01'}},
  {placeholder:{options:{name:'title',type:'title',x:0.8,y:3.05,w:11.7,h:1.2,fontFace:HEAD,fontSize:40,color:'FFFFFF',valign:'top',align:'left',margin:0},text:'Section title'}},
  {text:{text:FOOT,options:{x:0.8,y:6.95,w:8,h:0.3,fontFace:BODY,fontSize:9,color:MUTE,margin:0}}},
], slideNumber:{x:12.13,y:6.95,w:0.4,h:0.3,fontFace:BODY,fontSize:9,color:MUTE,align:'right',margin:0}});
pres.defineSlideMaster({title:'Content', background:{color:'FFFFFF'}, objects:[
  {placeholder:{options:{name:'title',type:'title',x:0.6,y:0.42,w:12.13,h:1.05,fontFace:HEAD,fontSize:26,color:INK,valign:'top',align:'left',margin:0},text:'Action title'}},
  {placeholder:{options:{name:'body',type:'body',x:0.6,y:1.8,w:12.13,h:4.8,fontFace:BODY,fontSize:16,color:INK,valign:'top',margin:0},text:'Body'}},
  {text:{text:FOOT,options:{x:0.6,y:6.95,w:8,h:0.3,fontFace:BODY,fontSize:9,color:MUTE,margin:0}}},
], slideNumber:{x:12.33,y:6.95,w:0.4,h:0.3,fontFace:BODY,fontSize:9,color:MUTE,align:'right',margin:0}});

const tb=(o)=>Object.assign({isTextBox:true,margin:0,fontFace:BODY,color:INK,valign:'top'},o);
const src=(s,t)=>s.addText(t,tb({x:0.6,y:6.55,w:12.13,h:0.28,fontSize:9,color:MUTE,objectName:'Source'}));
const hline=(s,x,y,w,c=LINE,wt=0.75)=>s.addShape(pres.shapes.LINE,{x,y,w,h:0,line:{color:c,width:wt}});

pres.addSection({title:'Opening'});
// 1 Title
let s=pres.addSlide({masterName:'Title',sectionTitle:'Opening'});
s.addText('Ironwood Data Center',{placeholder:'title'});
s.addText('Recommendation to KGE leadership',{placeholder:'subtitle'});
s.addText('SLAM Consulting  |  [Name], [Name], [Name], [Name]  |  October 2026',{placeholder:'meta'});
s.addNotes('Open with the team name and the decision KGE faces. Introduce each presenter by name and the part they cover. Keep this under thirty seconds.');

// 2 Executive summary
s=pres.addSlide({masterName:'Content',sectionTitle:'Opening'});
s.addText('[Recommendation in one sentence and the reason that wins it]',{placeholder:'title'});
s.addShape(pres.shapes.RECTANGLE,{x:0.6,y:1.8,w:4.5,h:4.6,fill:{color:TINT},line:{type:'none'},objectName:'Recommendation panel'});
s.addText('Our recommendation',tb({x:0.9,y:2.1,w:3.9,h:0.35,fontSize:13,bold:true,color:GREEN}));
s.addText('[What KGE should do, stated as a decision]',tb({x:0.9,y:2.55,w:3.9,h:2.2,fontFace:HEAD,fontSize:22}));
s.addText('[Condition or first step that makes it work]',tb({x:0.9,y:5.3,w:3.9,h:0.8,fontSize:13,color:SLATE}));
const rows=[['Financials','[Return against the 10% hurdle and the number]'],['Power and energy','[Supply option, cost per MWh, and timing]'],['Community','[Who carries the cost and what KGE commits to]'],['Risk','[Largest risk and how the plan contains it]']];
rows.forEach((r,i)=>{const y=1.8+i*1.15;
  if(i>0) hline(s,5.6,y,7.13);
  s.addText(r[0],tb({x:5.6,y:y+0.25,w:2.4,h:0.6,fontSize:15,bold:true}));
  s.addText(r[1],tb({x:8.1,y:y+0.25,w:4.63,h:0.75,fontSize:15,color:SLATE}));});
s.addNotes('This slide is the whole talk in one view. State the recommendation first, then walk the four findings in order. Every number here should match the section slide it comes from. If the judges only remember this slide, they should still know what KGE should do and why.');

// 3 Agenda
s=pres.addSlide({masterName:'Content',sectionTitle:'Opening'});
s.addText('Agenda',{placeholder:'title'});
const ag=[['Situation','2 min'],['Options we weighed','3 min'],['Financial case','4 min'],['Power and energy','4 min'],['Community and integrity','4 min'],['Risks and implementation','3 min']];
ag.forEach((a,i)=>{const y=1.8+i*0.78;
  hline(s,0.6,y,12.13);
  s.addText(String(i+1).padStart(2,'0'),tb({x:0.6,y:y+0.17,w:0.9,h:0.45,fontFace:HEAD,fontSize:22,color:GREEN}));
  s.addText(a[0],tb({x:1.6,y:y+0.2,w:8,h:0.45,fontSize:18}));
  s.addText(a[1],tb({x:10.73,y:y+0.22,w:2,h:0.4,fontSize:14,color:MUTE,align:'right'}));});
hline(s,0.6,1.8+6*0.78,12.13);
s.addNotes('Adjust the minutes so the total stays under twenty. The times here add to twenty, so cut one minute somewhere to leave room for a slow transition.');

const section=(num,title,note,divider=false)=>{pres.addSection({title});if(!divider) return title;const d=pres.addSlide({masterName:'Section',sectionTitle:title});d.addText(num,{placeholder:'num'});d.addText(title,{placeholder:'title'});d.addNotes(note);return title;};

// Situation
let sec=section('01','Situation','Use the divider to hand off between presenters. Say the name of the next speaker.');
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('[Headline that says what changed and why KGE has to decide now]',{placeholder:'title'});
[['Context','[Two or three fragments on KGE and the Ironwood site]'],['The decision','[The choice in front of KGE, in one line]'],['What makes it hard','[The tension the case sets up]']].forEach((b,i)=>{const y=1.8+i*1.55;
  s.addText(b[0],tb({x:0.6,y,w:6.6,h:0.4,fontSize:16,bold:true,color:GREEN}));
  s.addText(b[1],tb({x:0.6,y:y+0.45,w:6.6,h:0.9,fontSize:15,color:SLATE}));});
s.addShape(pres.shapes.RECTANGLE,{x:7.8,y:1.8,w:4.93,h:4.6,fill:{color:TINT},line:{type:'none'},objectName:'Facts panel'});
s.addText('Case facts',tb({x:8.1,y:2.05,w:4.3,h:0.35,fontSize:13,bold:true,color:GREEN}));
[['Phase 1 load','480 MW'],['Full campus','2,000 MW'],['Anchor contract','20 years'],['KGE hurdle rate','10%']].forEach((f,i)=>{const y=2.6+i*0.9;
  if(i>0) hline(s,8.1,y-0.12,4.33,'C9D1CC');
  s.addText(f[0],tb({x:8.1,y:y+0.05,w:2.4,h:0.5,fontSize:14,color:SLATE}));
  s.addText(f[1],tb({x:10.4,y,w:2.03,h:0.55,fontFace:HEAD,fontSize:22,align:'right'}));});
s.addNotes('Set up the problem in a few lines and stop. The judges have read the case, so skip any recap they could recite back. Keep the facts panel to numbers the rest of the deck uses.');

// Options
sec=section('02','Options we weighed','Hand off to the next presenter.');
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('[Headline that names the winning option and the criterion it wins on]',{placeholder:'title'});
const H=(t)=>({text:t,options:{bold:true,color:SLATE,fontSize:12,border:[{type:'none'},{type:'none'},{type:'solid',pt:1.5,color:INK},{type:'none'}]}});
const C=(t,o={})=>({text:t,options:Object.assign({fontSize:13,color:INK,border:[{type:'none'},{type:'none'},{type:'solid',pt:0.75,color:LINE},{type:'none'}]},o)});
const rec={fill:{color:GREENL},bold:true};
s.addTable([
  [H('Option'),H('Cost'),H('Speed to power'),H('Risk'),H('Community'),H('Overall')],
  [C('[Option A]',{bold:true}),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]')],
  [C('[Option B, recommended]',rec),C('[ ]',rec),C('[ ]',rec),C('[ ]',rec),C('[ ]',rec),C('[ ]',rec)],
  [C('[Option C]',{bold:true}),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]')],
],{x:0.6,y:1.85,w:12.13,colW:[3.13,1.8,1.8,1.8,1.8,1.8],rowH:[0.5,0.85,0.85,0.85],fontFace:BODY,valign:'middle',margin:[0.06,0.12,0.06,0.12],objectName:'Options table'});
s.addText('Shaded row marks the recommended option',tb({x:0.6,y:5.6,w:6,h:0.3,fontSize:11,color:MUTE}));
src(s,'Source: [Case packet; team analysis]');
s.addNotes('Fill each cell with a short verdict or a number instead of a sentence. Keep the same criteria order you use later in the deck. Move the shading to whichever row the team recommends.');

// Financial case
sec=section('03','Financial case','Hand off to the presenter covering returns.');
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('[Headline that says whether the project clears KGE\'s 10% hurdle]',{placeholder:'title'});
s.addTable([
  [H('Metric'),H('Base plan'),H('Hybrid design')],
  [C('Upfront capital',{bold:true}),C('[$ ]'),C('[$ ]')],
  [C('Project IRR',{bold:true}),C('[ %]'),C('[ %]')],
  [C('NPV at 10%',{bold:true}),C('[$ ]'),C('[$ ]')],
  [C('Payback',{bold:true}),C('[ years]'),C('[ years]')],
  [C('First power',{bold:true}),C('[year]'),C('[year]')],
],{x:0.6,y:1.85,w:7.4,colW:[3,2.2,2.2],rowH:[0.5,0.72,0.72,0.72,0.72,0.72],fontFace:BODY,valign:'middle',margin:[0.06,0.12,0.06,0.12],objectName:'Returns table'});
s.addShape(pres.shapes.RECTANGLE,{x:8.5,y:1.85,w:4.23,h:4.5,fill:{color:TINT},line:{type:'none'},objectName:'Assumptions panel'});
s.addText('Key assumptions',tb({x:8.8,y:2.1,w:3.7,h:0.35,fontSize:13,bold:true,color:GREEN}));
s.addText([
  {text:'[Revenue driver and price]',options:{bullet:true,breakLine:true}},
  {text:'[Cost driver and source]',options:{bullet:true,breakLine:true}},
  {text:'[Discount rate and term]',options:{bullet:true,breakLine:true}},
  {text:'[What would flip the answer]',options:{bullet:true}},
],tb({x:8.8,y:2.6,w:3.7,h:3.4,fontSize:14,color:SLATE,paraSpaceAfter:10}));
src(s,'Source: [Team model; case exhibits]');
s.addNotes('Lead with the IRR against the 10% hurdle, then the NPV. Name the one assumption that would change the answer because the judges will ask about it.');

// Power and energy
sec=section('04','Power and energy','Hand off to the presenter covering power.');
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('Onsite gas costs least per MWh, while only clean contracts and the hybrid meet the 2035 clean step',{placeholder:'title'});
s.addChart(pres.charts.BAR,[{name:'Cost per MWh',labels:['Grid only','Onsite gas','Grid + clean contracts','Grid + battery','Hybrid'],values:[93.6,67.1,103.3,103.9,113.6]}],{
  x:0.6,y:1.75,w:7.9,h:4.65,barDir:'col',barGapWidthPct:60,
  chartColors:['8A949C','8A949C',GREEN,'8A949C',GREEN],
  showValue:true,dataLabelPosition:'outEnd',dataLabelFormatCode:'$0.0',dataLabelColor:INK,dataLabelFontSize:12,dataLabelFontFace:'+mn-lt',
  catAxisLabelColor:SLATE,catAxisLabelFontSize:11,catAxisLabelFontFace:'+mn-lt',catAxisLineShow:true,catAxisLineColor:LINE,
  valAxisHidden:true,valAxisMinVal:0,valAxisMaxVal:130,valGridLine:{style:'none'},catGridLine:{style:'none'},
  showLegend:false,showTitle:true,title:'Phase 1 energy cost, $ per MWh',titleFontSize:12,titleColor:SLATE,titleFontFace:'+mn-lt',objectName:'Energy cost chart'});
s.addShape(pres.shapes.RECTANGLE,{x:8.9,y:1.75,w:3.83,h:4.65,fill:{color:TINT},line:{type:'none'},objectName:'Takeaway panel'});
s.addText('What this means',tb({x:9.2,y:2.0,w:3.3,h:0.35,fontSize:13,bold:true,color:GREEN}));
s.addText([
  {text:'Green bars meet the 2035 clean firm step',options:{bullet:true,breakLine:true}},
  {text:'Gas emits 62% more CO2 than the grid',options:{bullet:true,breakLine:true}},
  {text:'Gas rises to $112 at the 2024 PA industrial gas price',options:{bullet:true,breakLine:true}},
  {text:'Hybrid runs about 21% above grid only',options:{bullet:true}},
],tb({x:9.2,y:2.5,w:3.3,h:3.7,fontSize:14,color:SLATE,paraSpaceAfter:10}));
src(s,'Source: SLAM analysis; PJM 2028/29 auction, EIA, EPA eGRID2023, NREL, PA GRID Standards');
s.addNotes('Figures are for phase 1 at 480 MW and come from the Ironwood energy snapshot dated 19 October 2026. Gas looks cheapest only while the plant buys gas near the Henry Hub price. At the price Pennsylvania industrial users paid in 2024, gas costs $112 per MWh, which is above the grid. The hybrid costs more, however it is the only option that meets the clean step, leaves the grid during emergencies and could connect a year sooner.');

// Community
sec=section('05','Community and integrity','Hand off to the presenter covering the community.');
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('[Headline that says who carries the cost and what KGE commits to in return]',{placeholder:'title'});
const colHead=(x,t)=>{s.addText(t,tb({x,y:1.8,w:5.8,h:0.4,fontSize:16,bold:true,color:GREEN}));hline(s,x,2.3,5.8,INK,1.5);};
colHead(0.6,'What the community is worried about');colHead(6.93,'What KGE commits to');
[0,1,2].forEach(i=>{const y=2.3+i*1.3;
  if(i>0){hline(s,0.6,y,5.8);hline(s,6.93,y,5.8);}
  s.addText(`[Concern ${i+1} and who raised it]`,tb({x:0.6,y:y+0.25,w:5.8,h:0.85,fontSize:15,color:SLATE}));
  s.addText(`[Commitment that answers concern ${i+1}]`,tb({x:6.93,y:y+0.25,w:5.8,h:0.85,fontSize:15,color:SLATE}));});
src(s,'Source: [Case interviews; public comment; team analysis]');
s.addNotes('Pair every concern with a commitment on the same row, so the judges can see that nothing was left unanswered. Name the residents, the manufacturer and the township where the case does.');

// Risks and implementation
sec=section('06','Risks and implementation','Hand off to the presenter closing the deck.');
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('[Headline that says the largest risk is contained and how]',{placeholder:'title'});
s.addTable([
  [H('Risk'),H('Likelihood'),H('Impact'),H('Mitigation'),H('Owner')],
  [C('[Risk 1]',{bold:true}),C('[High / Med / Low]'),C('[High / Med / Low]'),C('[What KGE does about it]'),C('[Team]')],
  [C('[Risk 2]',{bold:true}),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]')],
  [C('[Risk 3]',{bold:true}),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]')],
  [C('[Risk 4]',{bold:true}),C('[ ]'),C('[ ]'),C('[ ]'),C('[ ]')],
],{x:0.6,y:1.85,w:12.13,colW:[2.6,1.8,1.8,4.33,1.6],rowH:[0.5,0.85,0.85,0.85,0.85],fontFace:BODY,valign:'middle',margin:[0.06,0.12,0.06,0.12],objectName:'Risk table'});
src(s,'Source: [Team analysis]');
s.addNotes('Order the risks from largest to smallest. Each mitigation should be something KGE can start this year.');

s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('[Headline that gives the first-power date if KGE decides this quarter]',{placeholder:'title'});
const years=['2027','2028','2029','2030','2031'];const gx=3.6,gw=9.13,cw=gw/5,gy=1.85;
years.forEach((yr,i)=>s.addText(yr,tb({x:gx+i*cw,y:gy,w:cw,h:0.35,fontSize:12,bold:true,color:SLATE,align:'center'})));
hline(s,0.6,gy+0.45,12.13,INK,1.5);
years.forEach((yr,i)=>{if(i>0) s.addShape(pres.shapes.LINE,{x:gx+i*cw,y:gy+0.5,w:0,h:4.0,line:{color:LINE,width:0.5,dashType:'dash'}});});
const ws=[['[Approvals and permits]',0,1.0,GREEN],['[Grid connection]',0.5,2.5,GREEN],['[Phase 1 construction]',1.0,2.2,GREEN],['[Phase 1 first power]',3.2,0.35,INK],['[Later phases]',3.3,1.7,'A9B4AD']];
ws.forEach((w,i)=>{const y=gy+0.65+i*0.8;
  if(i>0) hline(s,0.6,y-0.1,12.13);
  s.addText(w[0],tb({x:0.6,y:y+0.12,w:2.9,h:0.4,fontSize:14}));
  s.addShape(pres.shapes.RECTANGLE,{x:gx+w[1]*cw,y:y+0.13,w:w[2]*cw,h:0.36,fill:{color:w[3]},line:{type:'none'},objectName:'Bar '+(i+1)});});
src(s,'Source: [Case timeline; PJM interconnection estimates]');
s.addNotes('Drag each bar to the team\'s dates. Keep one row per workstream and no more than six rows, so the chart stays legible from the back of the room.');

// Closing
s=pres.addSlide({masterName:'Title',sectionTitle:sec});
s.addText('[Recommendation restated as one decision]',{placeholder:'title'});
s.addText('[The first step KGE takes this quarter]',{placeholder:'subtitle'});
s.addText('SLAM Consulting  |  Questions',{placeholder:'meta'});
s.addNotes('Restate the recommendation in the same words as the executive summary, then open for questions.');

// Appendix
sec=section('A','Appendix','Backup slides for the question and answer period. Do not present these unless asked.',true);
s=pres.addSlide({masterName:'Content',sectionTitle:sec});
s.addText('Sources',{placeholder:'title'});
const L=['PJM, 2028/2029 Base Residual Auction report','PJM Independent Market Monitor, 27 July 2026','PJM, 2025 State of the Market report','EPA, eGRID2023 summary tables','Duke University, Rethinking Load Growth','PJM Board letter on large load additions, 16 January 2026'];
const R=['Pennsylvania DCED, GRID Standards','EIA, capital cost report (AEO2020)','EIA, Short-Term Energy Outlook','NREL, 2025 battery cost update','LevelTen PPA price index, Q4 2025','[Add team sources]'];
const lst=(arr)=>arr.map((t,i)=>({text:t,options:{bullet:true,breakLine:i<arr.length-1}}));
s.addText(lst(L),tb({x:0.6,y:1.85,w:5.8,h:4.5,fontSize:13,color:SLATE,paraSpaceAfter:8}));
s.addText(lst(R),tb({x:6.93,y:1.85,w:5.8,h:4.5,fontSize:13,color:SLATE,paraSpaceAfter:8}));
s.addNotes('Full links for every power source are in docs/IRONWOOD-ENERGY.md in the leepr repo.');

(async()=>{await pres.writeFile({fileName:'SLAM-Ironwood-Template.pptx'});await applyTheme('SLAM-Ironwood-Template.pptx',THEME);console.log('built');})();
