import requests

while True:
    r = requests.get("https://gremlins-api.reddit.com/status")

    try:
        r.json()
    except:
        pass

    with open("status.txt", "a") as f:
        f.write(f'{r.text}\n')
