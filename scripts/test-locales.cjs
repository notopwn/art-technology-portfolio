'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
function element(dataset={}) {return {dataset,attrs:{},events:{},textContent:'',children:[],tabIndex:0,checked:false,addEventListener(k,fn){this.events[k]=fn},setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]},replaceChildren(...n){this.children=n},append(n){this.children.push(n)},querySelector(){return element()},querySelectorAll(){return []},classList:{add(){}},focus(){}};}
for(const language of ['ko','en']) {
 const roleParts={'.role-number':element(),'h3':element(),'.role-body':element()},rolePanel=element();rolePanel.querySelector=k=>roleParts[k];
 const viewImage=element();viewImage.parentElement=element();const description=element(),resultParts={span:element(),strong:element()},result=element();result.querySelector=k=>resultParts[k];
 const selector={};
 for(const [name,count] of [['role',3],['view',2],['bundle',2],['source',3]]) selector['[data-'+name+']']=Array.from({length:count},(_,i)=>{const values={role:i,view:['columns','graph'][i],bundle:i,source:i};const e=element({[name]:String(values[name])});e.id=name+i;e.attrs['aria-controls']=name+'panel';return e});
 const viewer=element();viewer.querySelector=()=>element();
 const document={documentElement:{lang:language,classList:{add(){}}},querySelectorAll:s=>selector[s]||[],querySelector:s=>s==='.viewer'?viewer:s==='.role-panel'?rolePanel:s==='.bundle-result'?result:element(),getElementById:s=>s==='view-image'?viewImage:s==='view-description'?description:element(),createElement:()=>element(),createTextNode:t=>({textContent:t}),body:{style:{}}};
 const context=vm.createContext({document,window:{},Set});vm.runInContext(fs.readFileSync(path.join(root,'site.js'),'utf8'),context);
 selector['[data-role]'][2].events.click();assert.match(roleParts['.role-body'].textContent,language==='en'?/artwork continues/:/작품/);
 selector['[data-view]'][1].events.click();assert.equal(viewImage.src,(language==='en'?'../':'')+'assets/finder-graph.webp');assert.match(description.textContent,language==='en'?/hierarchy/:/포함/);
 selector['[data-bundle]'][1].events.click();assert.equal(resultParts.span.textContent,language==='en'?'Exam prep.pdf':'시험 준비.pdf');
 const input=selector['[data-source]'][0];input.checked=false;input.events.change();assert.equal(resultParts.strong.textContent,language==='en'?'References 1 original':'1개의 원본을 참조');
 const input2=selector['[data-source]'][2];input2.checked=false;input2.events.change();assert.equal(resultParts.strong.textContent,language==='en'?'References 0 originals':'0개의 원본을 참조');
}
function checkLocale(lang,saved,languages=['ko-KR'],blocked=false,query='?test=1') {
 const storage={},events={},links=[{dataset:{languageChoice:'ko'},href:'https://notopwn.github.io/art-technology-portfolio/findernode.html',addEventListener(k,f){this[k]=f}}];let redirected=null;
 const document={documentElement:{lang,dataset:{page:'findernode.html'}},addEventListener(k,f){events[k]=f},querySelectorAll(s){return s==='[data-language-choice]'?links:[]}};
 const location={href:'https://notopwn.github.io/art-technology-portfolio/'+(lang==='en'?'en/':'')+'findernode.html'+query+'#assembly',search:query,hash:'#assembly',replace(t){redirected=t}};
 const localStorage={getItem(){if(blocked)throw Error();return saved},setItem(k,v){if(blocked)throw Error();storage[k]=v}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'locale.js'),'utf8'),{document,location,localStorage,URL,navigator:{languages,language:languages[0]}});events.DOMContentLoaded();return {redirected,storage,links};
}
const ko='https://notopwn.github.io/art-technology-portfolio/findernode.html?test=1#assembly';
const en='https://notopwn.github.io/art-technology-portfolio/en/findernode.html?test=1#assembly';
assert.equal(checkLocale('ko',null,['ko-KR']).redirected,null);
assert.equal(checkLocale('ko',null,['en-US']).redirected,en);
assert.equal(checkLocale('ko',null,['fr-FR','ko-KR','en-US']).redirected,null);
assert.equal(checkLocale('ko',null,['fr-FR','en-GB','ko-KR']).redirected,en);
assert.equal(checkLocale('ko',null,['ja-JP']).redirected,en);
assert.equal(checkLocale('ko',null,[]).redirected,null);
assert.equal(checkLocale('ko','ko',['en-US']).redirected,null);
assert.equal(checkLocale('ko','en',['ko-KR']).redirected,en);
assert.equal(checkLocale('en','ko',['en-US']).redirected,ko);
assert.equal(checkLocale('en',null,['en-US']).redirected,null);
assert.equal(checkLocale('ko','invalid',['en-US']).redirected,en);
assert.equal(checkLocale('en',null,['en-US'],true,'?lang=ko').redirected,'https://notopwn.github.io/art-technology-portfolio/findernode.html?lang=ko#assembly');
assert.equal(checkLocale('en','ko',['ko-KR'],false,'?lang=en').redirected,null);
assert.equal(checkLocale('ko',null,['en-US'],true).redirected,en);
const selection=checkLocale('en',null,['en-US']);selection.links[0].click();assert.equal(selection.storage['portfolio-language'],'ko');assert.ok(selection.links[0].href.endsWith('?lang=ko#assembly'));
console.log('Bilingual interactions and 15 locale cases passed: device preferences, regional language tags, ordered fallback, manual override, URL choice, section preservation and blocked storage.');
