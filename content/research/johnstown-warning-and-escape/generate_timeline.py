"""Create an original reported-event timeline; no simulation or interpolation."""
import csv,json,hashlib,os
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR','/tmp/cove-article-mpl')
import matplotlib
matplotlib.use('Agg')
matplotlib.rcParams['svg.hashsalt']='johnstown-reported-timeline-v1'
import matplotlib.pyplot as plt
ROOT=Path(__file__).resolve().parent
rows=list(csv.DictReader((ROOT/'timeline.csv').open()))
def mins(t):
 h,m=map(int,t.split(':')); assert 0<=h<24 and 0<=m<60; return h*60+m
assert len(rows)==5 and len({r['event_id'] for r in rows})==5
assert all(r['date']=='1889-05-31' for r in rows)
for r in rows: assert mins(r['reported_time_start'])<=mins(r['reported_time_end'])
fig,ax=plt.subplots(figsize=(11,6.5),dpi=160)
fig.patch.set_facecolor('#f7f4ed'); ax.set_facecolor('#f7f4ed')
for i,r in enumerate(rows):
 a,b=mins(r['reported_time_start']),mins(r['reported_time_end']); y=4-i
 color='#b74b37' if r['event_id']=='breach' else '#214c5a'
 ax.plot([780,a],[y,y],color='#d9d4c9',lw=1,zorder=1)
 if a==b: ax.scatter([a],[y],s=70,color=color,zorder=3)
 else: ax.plot([a,b],[y,y],color=color,lw=10,solid_capstyle='butt',zorder=3)
 label=r['reported_time_start']+(('–'+r['reported_time_end']) if a!=b else '')
 ax.annotate(label,(b,y),xytext=(8,0),textcoords='offset points',va='center',fontsize=10,color=color)
ax.set_yticks(range(4,-1,-1),[r['event_label'] for r in rows],fontsize=10)
ax.set_xticks([780,840,900,960,990],['13:00','14:00','15:00','16:00','16:30'])
ax.set_xlim(770,1000); ax.set_ylim(-.55,4.55)
ax.set_xlabel('Reported local clock time • May 31, 1889',labelpad=14,fontsize=11)
ax.tick_params(axis='y',length=0,pad=10)
for s in ['top','right','left']: ax.spines[s].set_visible(False)
ax.spines['bottom'].set_color('#a49c8c')
fig.suptitle('Warnings, breach, arrival',x=.05,y=.97,ha='left',fontsize=23,fontweight='bold',color='#15343d')
fig.text(.05,.89,'Five reported events in the Johnstown flood record',fontsize=12,color='#45575a')
fig.text(.05,.055,'Times are approximate. The breach range preserves differing accounts, not statistical uncertainty.\nWarnings shown are outgoing messages, not proof of receipt or time available to escape.\nSources: National Park Service, Johnstown Flood Timeline and Frequently Asked Questions.',fontsize=9,color='#45575a',linespacing=1.5)
fig.subplots_adjust(left=.34,right=.94,top=.81,bottom=.23)
for ext in ('svg','png'): fig.savefig(ROOT/f'timeline.{ext}',facecolor=fig.get_facecolor(),metadata={'Date':None,'Creator':'Original AI-assisted editorial graphic generated from timeline.csv'} if ext=='svg' else {})
plt.close(fig)
receipt={'rows':len(rows),'source_csv_sha256':hashlib.sha256((ROOT/'timeline.csv').read_bytes()).hexdigest(),'kind':'historical event timeline','fitted_model':False,'interpolation':False,'simulated_data':False,'clock_time_policy':'Reported local clock labels; no unsupported timezone conversion','matplotlib_version':matplotlib.__version__}
(ROOT/'figure_receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
