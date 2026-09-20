import publications from '../data/publications.json';
export const prerender=true;
export function GET(){
 const bib=publications.filter(p=>!p.sample).map(p=>`@${p.doi?'article':'misc'}{${p.id},\n  title = {${p.title}},\n  author = {${p.authors.join(' and ')}},\n  year = {${p.year}},${p.doi?`\n  doi = {${p.doi}},`:''}${p.arxiv?`\n  eprint = {${p.arxiv}},\n  archivePrefix = {arXiv},`:''}\n  url = {${p.doi?`https://doi.org/${p.doi}`:`https://arxiv.org/abs/${p.arxiv}`}}\n}`).join('\n\n');
 return new Response(bib+'\n',{headers:{'Content-Type':'application/x-bibtex; charset=utf-8'}});
}
