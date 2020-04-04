import json

big_data = []

with open('status.txt', 'r') as f:
    lines = f.readlines()
    for line in lines:
            big_data.append(json.loads(line))

with open('malformed_status.json', 'w') as outfile:
    json.dump(big_data, outfile, indent=4, sort_keys=True)
