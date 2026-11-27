"""Convert an operator-downloaded public Google Play device list to local JSON."""
import csv,json,sys,pathlib
from collections import defaultdict
if len(sys.argv)!=2: raise SystemExit('Usage: python scripts/import_catalog.py supported_devices.csv')
p=pathlib.Path(sys.argv[1]); raw=p.read_bytes()
encoding='utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig'
from io import StringIO
reader=csv.DictReader(StringIO(raw.decode(encoding))); models=defaultdict(set)
for row in reader:
    r={k.strip().lower(): (v or '').strip() for k,v in row.items() if k}
    name=r.get('marketing name') or r.get('model name'); brand=r.get('retail branding') or r.get('manufacturer') or ''
    if not name: continue
    full=name if not brand or name.lower().startswith(brand.lower()) else brand+' '+name
    for key in (r.get('model'),r.get('model code'),r.get('device')):
        if key and key.lower() not in ('k','unknown','generic'): models[key.lower()].add(full)
if not models: raise SystemExit('No recognized device columns; catalogue unchanged.')
out=pathlib.Path(__file__).resolve().parents[1]/'public/device-catalog.json';out.write_text(json.dumps({'source':'Google Play supported devices (operator-imported snapshot)','models':{k:sorted(v) for k,v in models.items()}},ensure_ascii=False,separators=(',',':')),encoding='utf-8');print(f'Imported {len(models)} model codes into {out}')
