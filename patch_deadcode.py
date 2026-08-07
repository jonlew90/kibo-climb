import re
with open("src/App.jsx", "r") as f:
    content = f.read()

def cut_between(content, start_str, end_str):
    start_idx = content.find(start_str)
    if start_idx == -1: return content
    end_idx = content.find(end_str, start_idx)
    if end_idx == -1: return content
    return content[:start_idx] + content[end_idx:]

content = cut_between(content, "{appState === 'sprint'", "{/* STREAK SAVED MODAL */}")

# Remove references
content = content.replace("(last 3 sprints)", "(last 3 sessions)")
content = content.replace("future daily sprints to reinforce memory!", "future daily sessions to reinforce memory!")

with open("src/App.jsx", "w") as f:
    f.write(content)
