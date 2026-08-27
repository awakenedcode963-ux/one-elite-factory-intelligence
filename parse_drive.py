import re

with open('drive_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Try to find all blocks that contain data-id and the file name
# Example: data-id="12LLN58EFwd33OJOPxJGqsY_1VQamKZq9" ... <strong class="DNoYtb">filename.docx</strong>

blocks = re.split(r'data-id="', html)
results = []
for block in blocks[1:]:
    file_id = block.split('"')[0]
    name_match = re.search(r'<strong class="DNoYtb">([^<]+)</strong>', block)
    if name_match:
        name = name_match.group(1)
        if (file_id, name) not in results:
            results.append((file_id, name))

for fid, name in results:
    print(f"{fid} {name}")
