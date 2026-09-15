import os
import json
import re
import time
from datetime import datetime, timezone
import sys
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

# Add scripts directory to sys.path if not present
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import build_blog_html

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is missing.")

client = genai.Client(api_key=api_key)

BASE_URL = "https://kiboclimb.com"

# -------------------------------------------------------------
# 1. System Prompt & Structured Generation Configuration
# -------------------------------------------------------------
system_prompt = """
You are an educational writer and content strategist for Kibo Climb (kiboclimb.com), a learning platform that turns core academic practice into an adventure alongside Kibo, an energetic red panda climbing Mount Kilimanjaro.

Write a 600-word blog post that is educational, casual, and genuinely fun to read. Keep paragraphs punchy and easy to scan, with light humor and practical takeaways for parents, teachers, and curious kids.

Topic Scope:
Write on a specific, high-intent topic from across the Kibo Climb curriculum, including:
- Math (mental math tricks, fraction hacks, multiplication mastery, tackling math anxiety)
- Coding & Logic (computational thinking, simple algorithms, puzzle-solving strategies)
- Language Arts (spelling patterns, vocabulary roots, memory tricks for tough words)
- Geography (map reading, world trivia, continental landmarks)

Voice & Style:
- Tone: Clean, encouraging, conversational, and witty. Keep it approachable rather than overly academic.
- Structure: Use clear Markdown headings (## for sections, ### for sub-steps). Break up dense text with bullet points, short callouts, or quick checklists.
- Punctuation Constraint: Do not use em dashes anywhere in the response. Use commas, parentheses, or periods instead.
- Concrete Examples: Provide practical, worked examples (e.g., step-by-step problem breakdowns, short pseudocode snippets, or memorable mnemonic sentences).
- Product Integration: Naturally weave in how Kibo Climb turns repetitive drills into an expedition up Mount Kilimanjaro, reinforcing skills through bite-sized, adaptive practice.
- Assets: Choose the single best featured_asset from the allowed list that visually complements the article.
"""

user_prompt = "Generate a fresh, high-value math strategy article as structured JSON."

response_schema = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING"},
        "slug": {"type": "STRING"},
        "meta_description": {"type": "STRING"},
        "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
        "featured_asset": {
            "type": "STRING",
            "enum": ["kibo-summit.jpeg", "kibo-thinking.jpeg", "kibo-climbing.jpeg"]
        },
        "content_markdown": {"type": "STRING"},
        "social_copy": {
            "type": "OBJECT",
            "properties": {
                "x_post": {"type": "STRING"},
                "short_blurb": {"type": "STRING"}
            },
            "required": ["x_post", "short_blurb"]
        }
    },
    "required": ["title", "slug", "meta_description", "tags", "featured_asset", "content_markdown", "social_copy"]
}

# -------------------------------------------------------------
# 2. Resilient API Call (Retries + Model Fallback)
# -------------------------------------------------------------
MODELS_TO_TRY = ["gemini-3.6-flash", "gemini-2.5-pro"]
max_retries = 3
response = None

for model_name in MODELS_TO_TRY:
    delay = 4
    for attempt in range(1, max_retries + 1):
        try:
            print(f"Calling Gemini API using {model_name} (Attempt {attempt}/{max_retries})...")
            response = client.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                    response_schema=response_schema,
                    temperature=0.7,
                ),
            )
            break
        except APIError as e:
            if e.code in (503, 500, 429) and attempt < max_retries:
                print(f"Temporary server issue ({e.code}). Retrying in {delay}s...")
                time.sleep(delay)
                delay *= 2
            else:
                print(f"Failed with {model_name}: {e.message}")
                break

    if response:
        print(f"Successfully received response via {model_name}.")
        break

if not response:
    raise RuntimeError("All configured Gemini models failed due to persistent server load.")

data = json.loads(response.text)

# Sanitize slug & add timestamps
slug = re.sub(r'[^a-zA-Z0-9-]', '', data["slug"].lower().replace(" ", "-"))
pub_date_iso = datetime.now(timezone.utc).isoformat()
pub_date_short = datetime.now(timezone.utc).strftime("%Y-%m-%d")

data["slug"] = slug
data["published_at"] = pub_date_iso

# -------------------------------------------------------------
# 3. Write Post JSON (For Client PWA / React Consumer)
# -------------------------------------------------------------
json_dir = os.path.join("src", "content", "blog")
os.makedirs(json_dir, exist_ok=True)
json_file_path = os.path.join(json_dir, f"{slug}.json")

with open(json_file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print(f" Saved JSON: {json_file_path}")

# -------------------------------------------------------------
# 4. Rebuild All Static HTML & Synchronize Sitemap
# -------------------------------------------------------------
print(" Rebuilding all blog HTML pages and updating sitemap...")
build_blog_html.build_all()
print(" Pipeline Complete.")
