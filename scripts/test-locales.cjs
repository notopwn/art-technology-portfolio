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
function checkLocale(lang,saved,blocked=false) {
 const storage={},events={},links=[{dataset:{languageChoice:'ko'},href:'https://notopwn.github.io/art-technology-portfolio/findernode.html',addEventListener(k,f){this[k]=f}}];let redirected=null;
 const document={documentElement:{lang,dataset:{page:'findernode.html'}},addEventListener(k,f){events[k]=f},querySelectorAll(){return links}};
 const location={href:'https://notopwn.github.io/art-technology-portfolio/'+(lang==='en'?'en/':'')+'findernode.html?test=1#assembly',search:'?test=1',hash:'#assembly',replace(t){redirected=t}};
 const localStorage={getItem(){if(blocked)throw Error();return saved},setItem(k,v){if(blocked)throw Error();storage[k]=v}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'locale.js'),'utf8'),{document,location,localStorage,URL});events.DOMContentLoaded();return {redirected,storage,links};
}
assert.equal(checkLocale('ko',null).redirected,null);
assert.equal(checkLocale('ko','en').redirected,'https://notopwn.github.io/art-technology-portfolio/en/findernode.html?test=1#assembly');
const en=checkLocale('en','ko');assert.equal(en.redirected,null);assert.equal(en.storage['portfolio-language'],'en');en.links[0].click();assert.equal(en.storage['portfolio-language'],'ko');assert.ok(en.links[0].href.endsWith('#assembly'));
assert.equal(checkLocale('ko',null,true).redirected,null);
console.log('Both languages: role tabs, view switching, media paths, bundle editing, singular/plural, language preference, hash preservation and unavailable storage passed.');
