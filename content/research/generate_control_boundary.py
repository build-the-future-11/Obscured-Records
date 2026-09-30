"""Reproduce the original conceptual Knight diagram; no network or measured scale."""
import json, os
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR','/tmp/obscured-mpl')
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
root=Path(__file__).resolve().parent/'knight-capital-order-boundary'
data=json.loads((root/'diagram_data.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans','svg.hashsalt':'obscured-knight-v1'})
fig,ax=plt.subplots(figsize=(12,5),dpi=150)
fig.patch.set_facecolor('#f6f3ec');ax.set_facecolor('#f6f3ec');ax.set_xlim(0,12);ax.set_ylim(0,5);ax.axis('off')
ax.text(.2,4.6,'Where the instruction becomes an action',fontsize=20,weight='bold',color='#152b39')
ax.text(.2,4.13,'KNIGHT CAPITAL  •  CONCEPTUAL CONTROL BOUNDARY',fontsize=10,color='#486473')
for i,node in enumerate(data['nodes']):
 x=.2+i*4
 ax.add_patch(FancyBboxPatch((x,1.8),3.45,1.65,boxstyle='round,pad=0.10',facecolor='#ffffff',edgecolor='#486473',linewidth=1.3))
 ax.text(x+.15,3.08,node['title'],fontsize=13,weight='bold',color='#152b39')
 ax.text(x+.15,2.55,node['detail'],fontsize=11,color='#152b39',linespacing=1.5)
 if i<2:ax.annotate('',xy=(x+3.9,2.6),xytext=(x+3.6,2.6),arrowprops={'arrowstyle':'->','color':'#ad4d31','lw':2})
ax.text(.2,.95,data['caption'],fontsize=10,color='#486473',linespacing=1.5)
ax.text(.2,.25,'Source: SEC Release 70694, paras. 12–16, 20–25; SEC 2010 rule announcement',fontsize=9,color='#486473')
for ext in ['svg','png']:fig.savefig(root/f'diagram.{ext}',facecolor=fig.get_facecolor(),metadata={'Date':None} if ext=='svg' else None)
p=root/'diagram.svg';p.write_text('\n'.join(l.rstrip() for l in p.read_text().splitlines())+'\n')
plt.close(fig)
