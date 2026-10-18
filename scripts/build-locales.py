"""Build static English pages from Korean sources; fail on untranslated Korean copy.
Run after editing a Korean page and updating translations.en.json.
"""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json,re
ROOT=Path(__file__).resolve().parents[1]
T=json.loads((ROOT/'scripts/translations.en.json').read_text())
T.update({'언어 선택':'Language selection','한국어':'한국어'})
PAGES=['index.html','digitaltactillity.html','findernode.html','photoeditor.html','elitecomposer.html']
VERSION='bilingual-1'
BASE='https://notopwn.github.io/art-technology-portfolio/'
class Translate(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=False);self.out=[]
 def translated(self,value):
  key=value.strip()
  if re.search('[가-힣]',key):
   if key not in T:raise ValueError('Untranslated: '+key)
   return value[:len(value)-len(value.lstrip())]+T[key]+value[len(value.rstrip()):]
  return value
 def handle_starttag(self,tag,attrs):
  arr=[]
  for key,val in attrs:
   if val is None:arr.append(key);continue
   if key in ['alt','aria-label','data-caption','content']:val=self.translated(val)
   if key in ['href','src','data-image','data-video']:
    if val.startswith(('assets/','style.css','site.js','locale.js')):val='../'+val
   if tag=='html' and key=='lang':val='en'
   if tag=='html' and key=='data-language':val='en'
   arr.append(key+'="'+escape(val,quote=True)+'"')
  self.out.append('<'+tag+(' '+' '.join(arr) if arr else '')+'>')
 def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)
 def handle_endtag(self,tag):self.out.append('</'+tag+'>')
 def handle_data(self,data):self.out.append(escape(self.translated(data),quote=False))
 def handle_entityref(self,name):self.out.append('&'+name+';')
 def handle_charref(self,name):self.out.append('&#'+name+';')
 def handle_decl(self,decl):self.out.append('<!'+decl+'>')
 def handle_comment(self,text):self.out.append('<!--'+text+'-->')
def switch(page,english=False):
 ko='../'+page if english else page
 en=page if english else 'en/'+page
 return '<div class="language-switch" role="group" aria-label="'+('Language selection' if english else '언어 선택')+'"><a href="'+ko+'" lang="ko" data-language-choice="ko"'+(' aria-current="true"' if not english else '')+'>한국어</a><a href="'+en+'" lang="en" data-language-choice="en"'+(' aria-current="true"' if english else '')+'>EN</a></div>'
(ROOT/'en').mkdir(exist_ok=True)
for page in PAGES:
 p=ROOT/page;s=p.read_text()
 s=re.sub(r'<div class="language-switch".*?</div>','',s,flags=re.S)
 s=re.sub(r'<script src="(?:\.\./)?locale.js[^\"]*"[^>]*></script>','',s)
 s=re.sub(r'<link rel="(?:alternate|canonical)"[^>]*>','',s)
 s=re.sub(r'<html[^>]*>','<html lang="ko" data-language="ko" data-page="'+page+'">',s,count=1)
 s=re.sub(r'href="style.css(?:\?[^\"]*)?"','href="style.css?v='+VERSION+'"',s)
 s=re.sub(r'src="site.js(?:\?[^\"]*)?"','src="site.js?v='+VERSION+'"',s)
 s=s.replace('</nav></header>','</nav>'+switch(page)+'</header>',1)
 s=s.replace('</head>','<script src="locale.js?v='+VERSION+'"></script></head>')
 p.write_text(s)
 # Translate text and accessible labels, then fix language-specific links.
 parser=Translate();parser.feed(s);en=''.join(parser.out)
 en=re.sub(r'<div class="language-switch".*?</div>',switch(page,True),en,flags=re.S)
 for lang,text in [('ko',s),('en',en)]:
  path=BASE+('en/' if lang=='en' else '')+page
  links='<link rel="canonical" href="'+path+'"><link rel="alternate" hreflang="ko" href="'+BASE+page+'"><link rel="alternate" hreflang="en" href="'+BASE+'en/'+page+'"><link rel="alternate" hreflang="x-default" href="'+BASE+page+'">'
  text=text.replace('</head>',links+'</head>')
  (ROOT/('en/'+page if lang=='en' else page)).write_text(text)
print('Built 5 Korean and 5 English pages. All Korean source copy translated.')
