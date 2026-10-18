from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re
ROOT=Path(__file__).resolve().parents[1]
PAGES=['index.html','digitaltactillity.html','findernode.html','photoeditor.html','elitecomposer.html']
class Page(HTMLParser):
 def __init__(self,p):super().__init__();self.path=p;self.ids=set();self.refs=[];self.aria=[];self.h1=0;self.lang=None;self.en=False;self.text=[];self.choices=[];self.current=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='html':self.lang=a['lang'];self.en=self.lang=='en'
  if 'id' in a:assert a['id'] not in self.ids;self.ids.add(a['id'])
  if tag=='h1':self.h1+=1
  for k in ['href','src','data-image','data-video']:
   if k in a:self.refs.append(a[k])
  for k in ['aria-labelledby','aria-controls']:
   if k in a:self.aria.extend(a[k].split())
  if 'data-language-choice' in a:self.choices.append((a['data-language-choice'],a['href']));self.current.extend([a['data-language-choice']] if a.get('aria-current')=='true' else [])
  if self.en:
   for k in ['alt','aria-label','data-caption','content']:assert not re.search('[가-힣]',a.get(k,'')),(self.path,k,a.get(k))
 def handle_data(self,t):
  if self.en:assert not re.search('[가-힣]',t.replace('한국어','')),(self.path,t)
parsed={}
for n in PAGES+['en/'+n for n in PAGES]:
 p=ROOT/n;doc=Page(p);doc.feed(p.read_text());parsed[p.resolve()]=doc
 assert doc.h1==1,(n,doc.h1)
 assert doc.lang==('en' if n.startswith('en/') else 'ko')
 assert doc.current==[doc.lang],(n,doc.current)
 assert len(doc.choices)==2
 assert all(x in doc.ids for x in doc.aria)
 for lang,href in doc.choices:
  target=(p.parent/urlsplit(href).path).resolve()
  expected=(ROOT/('en/' if lang=='en' else '')/p.name).resolve();assert target==expected,(n,lang,href)
for p,doc in parsed.items():
 for ref in doc.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc:continue
  target=(p.parent/unquote(u.path)).resolve() if u.path else p
  if target.is_dir():target=target/'index.html'
  assert target.is_file(),(p,ref)
  if u.fragment and target.suffix=='.html':assert u.fragment in parsed[target].ids,(p,ref)
for ref in re.findall(r'url\([\'\"]?([^\)\'\"]+)',(ROOT/'style.css').read_text()):assert (ROOT/ref).is_file(),ref
print('10 pages: complete English copy, translated accessibility text, valid assets, cross-language counterparts, heading/ARIA/anchor structure passed.')
