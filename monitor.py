import os
import pygit2
import difflib
from datetime import datetime
from subprocess import Popen

import requests

from derw import log

# GIT
GIT_REPO = os.environ.get("GIT_REPO")
GIT_USERNAME = os.environ.get("GIT_USERNAME")
GIT_EMAIL = os.environ.get("GIT_EMAIL")
GIT_PASSWORD = os.environ.get("GIT_PASSWORD")

# WEBHOOK
WEBHOOK_URL = os.environ.get("WEBHOOK_URL")

USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'

class Git():
    def __init__(self):
        self.repo = pygit2.Repository(os.path.join(os.path.relpath(GIT_REPO), '.git'))

        creds = pygit2.UserPass(GIT_USERNAME, GIT_PASSWORD)
        self.remote = pygit2.RemoteCallbacks(credentials=creds)
        self.author = pygit2.Signature(GIT_USERNAME, GIT_EMAIL)

    def pull(self):
        self.repo.reset(self.repo.head.target, pygit2.GIT_RESET_HARD)
        self.repo.remotes["origin"].fetch(callbacks=self.remote)
        target = self.repo.references.get('refs/remotes/origin/master').target
        reference = self.repo.references.get('refs/heads/master')
        reference.set_target(target)

        self.repo.checkout_head()

    def commit_and_push(self):
        ref = "refs/heads/master"

        diff = self.repo.diff()

        if not len(diff):
            log.info("No changes, commit not needed")
            return

        requests.post(WEBHOOK_URL, data = {"content": "<@167726726451953664> Changes to monitored files"})

        return

        index = git.repo.index
        index.add_all(pathspecs=['content'])
        index.write()
        tree = index.write_tree()

        message = (
            f'{datetime.utcnow()}'
        )

        oid = self.repo.create_commit(ref, self.author, self.author, message, tree, [self.repo.revparse_single('HEAD').hex])

        log.info(f'Created commit {oid}')

        self.repo.remotes["origin"].push([ref], callbacks=self.remote)

git = Git()
# git.pull()

p = Popen([
    "wget",
    "--directory-prefix", "content",
    "--timestamping",
    "--mirror",
    "--page-requisites",
    "--compression", "auto",
    "--no-check-certificate",
    "--no-verbose",
    "--user-agent", USER_AGENT,
    "--content-on-error",
    "--input-file", "links.txt"
])

p.wait()
out, err = p.communicate()

if err:
    print(f'ERROR: {err}')

git.commit_and_push()
