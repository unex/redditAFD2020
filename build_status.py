import os
import json

import subprocess
from subprocess import Popen
from datetime import datetime, timezone, timedelta

import pygit2

repo = pygit2.Repository(os.path.join(os.path.relpath('.'), '.git'))

FILE = 'content/gremlins-api.reddit.com/status'

big_data = []

with open('status_commits.txt', 'r') as f:
    lines = f.readlines()
    print(f'{len(lines)} lines')
    for line in reversed(lines):
        oid = line.split(' ')[0]

        commit = repo.revparse_single(oid)

        dt = datetime.fromtimestamp(float(commit.author.time)) - timedelta(minutes=commit.author.offset)

        p = Popen([
            "git", "checkout",
            oid,
            FILE
        ])

        print(end='')

        p.wait()

        with open(FILE, 'r') as status:
            text = status.read().replace('\n', '')

            try:
                data = json.loads(text)
                data['timestamp'] = dt.timestamp()
                big_data.append(data)
            except:
                print(f'error {text}')


with open('status_alltime.json', 'w') as outfile:
    json.dump(big_data, outfile, indent=4, sort_keys=True)
