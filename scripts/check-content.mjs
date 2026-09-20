import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const papers=JSON.parse(await readFile(path.join(root,'src/data/publications.json'),'utf8'));
const errors=[];
const ids=new Set();
for(const p of papers){
  if(ids.has(p.id))errors.push(`Duplicate paper id: ${p.id}`);ids.add(p.id);
  if(!p.title||!p.authors?.length||!Number.isInteger(p.year)||typeof p.sample!=='boolean')errors.push(`Incomplete paper: ${p.id}`);
  if(p.sample&&(p.doi||p.arxiv))errors.push(`Fictional paper must not claim a real identifier: ${p.id}`);
  if(!p.sample&&!p.doi&&!p.arxiv)errors.push(`Real paper needs a verifiable source: ${p.id}`);
}
const dist=path.join(root,'dist');
async function files(dir){const entries=await readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const all=await files(dist);
const prefix=(process.env.BASE_PATH||'/').replace(/\/$/,'');
let links=0;
for(const file of all.filter(f=>f.endsWith('.html'))){
  const html=await readFile(file,'utf8');
  for(const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)){
    const raw=match[1].replaceAll('&amp;','&');
    if(/^(https?:|mailto:|tel:|data:|#)/.test(raw))continue;
    const clean=decodeURIComponent(raw.split(/[?#]/)[0]);
    if(!clean)continue;
    if(clean.startsWith('/')&&prefix&&clean!==prefix&&!clean.startsWith(prefix+'/')){errors.push(`Missing deployment prefix in ${path.relative(dist,file)}: ${clean}`);continue;}
    const local=clean.startsWith('/')?path.join(dist,clean.slice(prefix.length)):path.resolve(path.dirname(file),clean);
    const candidates=clean.endsWith('/')?[path.join(local,'index.html')]:[local,path.join(local,'index.html')];
    let exists=false;for(const candidate of candidates){try{await access(candidate);exists=true;break;}catch{}}
    if(!exists)errors.push(`Broken local link in ${path.relative(dist,file)}: ${raw}`);links++;
  }
}
const bib=await readFile(path.join(dist,'publications.bib'),'utf8');
for(const p of papers)if(p.sample&&bib.includes(p.id))errors.push(`Sample paper leaked into BibTeX: ${p.id}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${papers.length} publication records, ${all.filter(f=>f.endsWith('.html')).length} HTML pages, ${links} local references, and real-paper-only BibTeX.`);
