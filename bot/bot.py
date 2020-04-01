import os
import re
import requests
import time
import random

API_BASE = "https://gremlins-api.reddit.com"
API_KEY = os.environ.get("API_KEY")

cookies = {"reddit_session": API_KEY}

re_csrf = re.compile(r"<gremlin-app\n\s*csrf=\"(.*)\"")
re_notes_ids = re.compile(r"<gremlin-note id=\"(.*)\"")
re_notes = re.compile(r"<gremlin-note id=\".*\">\n\s*(.*)")


while True:
    r = requests.get(f'{API_BASE}/room', cookies=cookies)

    csrf = re_csrf.findall(r.text)[0]
    ids = re_notes_ids.findall(r.text)
    notes_content = re_notes.findall(r.text)

    notes = {ids[i]: notes_content[i] for i in range(len(ids))}

    _id = random.choice(ids)
    text = notes[_id]

    r = requests.post(f'{API_BASE}/submit_guess', cookies=cookies, data = {
        "note_id": _id,
        "csrf_token": csrf
    })

    try:
        r.json()
    except:
        print(r.text)
        continue


    correct = r.json()["result"] == "WIN"
    options = [
        {
            "message": text,
            "correct": True
        },
        *[{
            "message": content,
            "correct": False
        } for i, content in notes.items() if i != _id]
    ] if correct else [
        {
            "message": text,
            "correct": False
        }
    ]

    print(f'Try {_id} - {r.json()["result"]}')

    r = requests.post(f'https://api.snakeroom.org/y20/submit', json = {
        "options": options
    })


    try:
        r.json()
    except:
        print(r.text.replace('\n', ''))
        print(options)
        continue

    time.sleep(.3)
