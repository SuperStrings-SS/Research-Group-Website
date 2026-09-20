import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const research = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/research' }), schema: z.object({ title: z.string(), short: z.string(), number: z.string(), question: z.string(), summary: z.string(), diagram: z.enum(['cobordism', 'network', 'circuit', 'surface', 'learning']) }) });
const people = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/people' }), schema: z.object({ name: z.string(), role: z.string(), initials: z.string(), order: z.number(), sample: z.boolean(), interests: z.string(), office: z.string().optional(), link: z.string().url().optional(), alumni: z.boolean().default(false) }) });
const news = defineCollection({ loader: glob({ pattern: '*.md', base: './src/content/news' }), schema: z.object({ title: z.string(), date: z.string(), kind: z.enum(['Seminar','Group news','Reading group']), summary: z.string(), sample: z.boolean(), time: z.string().optional(), location: z.string().optional() }) });
export const collections = { research, people, news };
