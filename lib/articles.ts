export type Article = {
  title: string; subtitle: string; slug: string; author: string; authorSlug: string;
  date: string; updated: string; section: string; excerpt: string; featured: boolean;
  breaking: boolean; underreported: boolean; special?: boolean; recordId: string; readingTime: string; tags: string[];
};

export const articles: Article[] = [
  { title:"The Route Everyone Missed", subtitle:"A quiet contest for ports along the Mozambique Channel is redrawing the map of global trade — one lease at a time.", slug:"the-route-everyone-missed", author:"Mara Voss", authorSlug:"mara-voss", date:"14 Sep 2026", updated:"14 Sep 2026", section:"Underreported", excerpt:"Behind closed doors, a chain of port agreements is shifting leverage across the western Indian Ocean.", featured:true, breaking:false, underreported:true, special:true, recordId:"0421", readingTime:"8 min", tags:["geopolitics","resources"] },
  { title:"The Grid Was Never Ready for This Much Weather", subtitle:"The infrastructure designed for yesterday’s climate is becoming today’s fault line.", slug:"the-grid-was-never-ready", author:"Anika Shah", authorSlug:"anika-shah", date:"14 Sep 2026", updated:"14 Sep 2026", section:"Science", excerpt:"Engineers are learning that redundancy matters more than prediction as weather systems outrun the models.", featured:true, breaking:false, underreported:false, recordId:"0197", readingTime:"7 min", tags:["climate","infrastructure"] },
  { title:"The Quiet Economics of Empty Office Towers", subtitle:"What the vacancy data leaves out.", slug:"quiet-economics-empty-towers", author:"Eli Mercer", authorSlug:"eli-mercer", date:"13 Sep 2026", updated:"13 Sep 2026", section:"Business", excerpt:"A second-order crisis is forming in the streets around buildings no one needs anymore.", featured:false, breaking:false, underreported:true, recordId:"0419", readingTime:"6 min", tags:["cities","economy"] },
  { title:"Who Owns the Language of the Next Billion Users?", subtitle:"Inside the race to build AI for the world’s least digitized languages.", slug:"who-owns-the-next-billion-voices", author:"Noor Okafor", authorSlug:"noor-okafor", date:"13 Sep 2026", updated:"14 Sep 2026", section:"Technology", excerpt:"Communities are being asked to donate the raw material for systems they may never control.", featured:false, breaking:false, underreported:true, recordId:"0416", readingTime:"11 min", tags:["ai","language"] },
  { title:"A Republic of Borrowed Water", subtitle:"The aquifers beneath a border region are disappearing faster than its treaties can adapt.", slug:"republic-of-borrowed-water", author:"Lucía Rojas", authorSlug:"lucia-rojas", date:"12 Sep 2026", updated:"12 Sep 2026", section:"World", excerpt:"On paper, the water is shared. Underground, it is vanishing.", featured:false, breaking:false, underreported:true, recordId:"0412", readingTime:"9 min", tags:["water","borders"] },
  { title:"The Museum That Catalogued a Disappearing Coast", subtitle:"One curator’s race to preserve a landscape before it moves inland.", slug:"museum-disappearing-coast", author:"Theo Bell", authorSlug:"theo-bell", date:"11 Sep 2026", updated:"11 Sep 2026", section:"Culture", excerpt:"An archive of ordinary objects has become evidence of an extraordinary retreat.", featured:false, breaking:false, underreported:true, recordId:"0408", readingTime:"5 min", tags:["culture","climate"] },
  { title:"The Semiconductor City Built Between Two Fault Lines", subtitle:"A manufacturing miracle faces a geological and political stress test.", slug:"semiconductor-city-fault-lines", author:"Kenji Mori", authorSlug:"kenji-mori", date:"10 Sep 2026", updated:"10 Sep 2026", section:"Technology", excerpt:"The most important factory district in the world was never designed to be replaceable.", featured:false, breaking:false, underreported:false, recordId:"0404", readingTime:"12 min", tags:["chips","industry"] },
  { title:"What the New Arctic Maps Don’t Show", subtitle:"As the ice retreats, ownership lines are being drawn over moving ground.", slug:"arctic-maps", author:"Mara Voss", authorSlug:"mara-voss", date:"09 Sep 2026", updated:"09 Sep 2026", section:"World", excerpt:"The cartography is precise. The terrain it describes is anything but.", featured:false, breaking:false, underreported:false, recordId:"0398", readingTime:"8 min", tags:["arctic","maps"] },
];

export const worldUpdates = [
  { time:"11:24", city:"Kyiv", text:"Power authorities extend rolling repair schedules after overnight infrastructure damage." },
  { time:"10:17", city:"Beijing", text:"New industrial data points to an uneven rebound beyond major coastal cities." },
  { time:"08:53", city:"Nairobi", text:"Regional health labs begin sharing outbreak data through a new cross-border network." },
  { time:"07:41", city:"Washington", text:"Senate negotiators revive a narrower critical-minerals framework." },
  { time:"06:12", city:"Santiago", text:"Copper unions open wage talks as global stockpiles reach a five-year low." },
];

export function getArticle(slug: string) { return articles.find(a => a.slug === slug); }
export const sections = ["World","Business","Technology","Science","Culture","Underreported"];
