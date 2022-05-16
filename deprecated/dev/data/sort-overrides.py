# util to sort project data overrides by ID

import json

fp = './overrides.json'

with open(fp, 'r') as f:
    data = json.load(f)
projects = data['projects']

print('sorting ', len(projects), 'projects...')
projects = sorted(projects, key=lambda x: x['id'].upper())
data['projects'] = projects

with open(fp, 'w') as f:
    f.write(json.dumps(data, indent=2))
    print('Rewrote projects to', fp)
