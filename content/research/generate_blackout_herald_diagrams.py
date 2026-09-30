import json, pathlib, textwrap, os
from datetime import date
os.environ['MPLCONFIGDIR']='/tmp/cove-article-mpl'
import matplotlib
matplotlib.use('Agg');matplotlib.rcParams['svg.hashsalt']='obscured-official-record-pair-v1'
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
base=pathlib.Path(__file__).resolve().parent
url='https://www.canada.ca/en/news/archive/2004/04/canada-task-force-presents-final-report-blackout-august-2003.html'
d=[{'id':i,'category':c,'source_url':url,'quantitative_weight':None} for i,c in enumerate(['Inadequate system understanding','Inadequate situational awareness','Inadequate tree trimming','Inadequate reliability-coordinator diagnostic support'],1)]
p=base/'blackout-2003-silent-alarms'; (p/'diagram_data.json').write_text(json.dumps({'kind':'categorical classification','reported_date':'2004-04-05','groups':d},indent=2)+'\n')
fig,ax=plt.subplots(figsize=(11,6.4),dpi=160);fig.patch.set_facecolor('#f7f4ed');ax.set_facecolor('#f7f4ed');ax.axis('off');ax.set_xlim(0,1);ax.set_ylim(0,1)
for i,r in enumerate(d):
 x=.04+(i%2)*.49;y=.49-(i//2)*.34
 ax.add_patch(FancyBboxPatch((x,y),.43,.27,boxstyle='round,pad=.012',facecolor='#e3e9e5',edgecolor='#617b75'))
 ax.text(x+.03,y+.20,str(i+1),fontsize=11,color='#617b75')
 ax.text(x+.03,y+.13,textwrap.fill(r['category'],25),fontsize=15,color='#15343d',va='center')
fig.text(.055,.925,'Four groups of causes',fontsize=25,weight='bold',color='#15343d')
fig.text(.055,.86,'The official 2004 account of the August 2003 blackout',fontsize=12,color='#45575a')
fig.text(.055,.055,'Equal box size is a layout choice, not equal responsibility. This diagram assigns no numerical weights.\nSource: Government of Canada, April 5, 2004 final-report announcement.',fontsize=10,color='#45575a',linespacing=1.5)
fig.subplots_adjust(left=0,right=1,top=.9,bottom=.1)
for ext in ['svg','png']:fig.savefig(p/f'diagram.{ext}',metadata={'Date':None,'Creator':'Original AI-assisted editorial diagram'} if ext=='svg' else {})
plt.close(fig)
url='https://www.imo.org/en/ourwork/humanelement/pages/safetymanagement-default.aspx'
d=[{'date':date,'precision':prec,'year':year,'label':label,'source_url':url} for date,prec,year,label in [('1987','year',1987,'Call for management guidelines'),('1989','year',1989,'Guidelines adopted'),('1991','year',1991,'Guidelines revised'),('1993','year',1993,'ISM Code adopted'),('1998-07-01','day',1998+(date(1998,7,1)-date(1998,1,1)).days/365,'SOLAS amendments enter into force')]]
p=base/'herald-confirming-the-doors';(p/'diagram_data.json').write_text(json.dumps({'kind':'selected administrative milestones','effectiveness_estimate':None,'events':d},indent=2)+'\n')
fig,ax=plt.subplots(figsize=(11,6.4),dpi=160);fig.patch.set_facecolor('#f7f4ed');ax.set_facecolor('#f7f4ed')
for i,r in enumerate(d):
 y=4-i;ax.scatter(r['year'],y,s=75,color='#214c5a');ax.text(r['year']+.2,y,r['date'],va='center',fontsize=10,color='#214c5a')
ax.set_yticks(range(4,-1,-1),[r['label'] for r in d],fontsize=11);ax.tick_params(axis='y',length=0,pad=10);ax.set_xticks([1987,1990,1993,1996,1999]);ax.set_xlim(1986.5,2000.2);ax.set_ylim(-.5,4.5)
for s in ['left','right','top']:ax.spines[s].set_visible(False)
ax.set_xlabel('Calendar year',fontsize=11,labelpad=12);ax.grid(axis='x',color='#ded8cb',lw=.7)
fig.suptitle('From guidelines to a mandatory code',x=.04,y=.96,ha='left',fontsize=20,weight='bold',color='#15343d')
fig.text(.04,.87,'Selected IMO safety-management milestones',fontsize=12,color='#45575a')
fig.text(.04,.045,'Year-only records are placed at their labelled year; they do not imply January 1 adoption.\nThese dates do not measure compliance or accident prevention. Source: International Maritime Organization.',fontsize=9,color='#45575a',linespacing=1.5)
fig.subplots_adjust(left=.40,right=.94,top=.8,bottom=.21)
for ext in ['svg','png']:fig.savefig(p/f'diagram.{ext}',metadata={'Date':None,'Creator':'Original AI-assisted editorial diagram'} if ext=='svg' else {})
plt.close(fig)

# Normalize generator whitespace without changing vector geometry.
for slug in ('blackout-2003-silent-alarms', 'herald-confirming-the-doors'):
    svg=base/slug/'diagram.svg'
    svg.write_text('\n'.join(line.rstrip() for line in svg.read_text().splitlines())+'\n')
