import os
import json
import re
from datetime import datetime, timezone
import xml.etree.ElementTree as ET
from xml.dom import minidom
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is missing.")

client = genai.Client(api_key=api_key)

BASE_URL = "https://kiboclimb.com"

# 1. Prompt configured for high-intent educational SEO
system_prompt = """
You are an expert educational writer and SEO strategist for Kibo Climb, an adaptive math learning app.
Write an engaging, authoritative 600-word article focusing on a specific, high-intent math topic (mental math shortcuts, fraction strategies, tackling math anxiety, or gamified mastery).

SEO Rules:
- Structure with clear Markdown headers (## for main sections, ### for sub-steps).
- Include concrete, step-by-step worked numerical examples.
- Naturally include an internal call-to-action mentioning Kibo Climb (https://kiboclimb.com).
- Keep the tone encouraging, clear, and actionable for parents, teachers, and upper elementary students.
"""

user_prompt = "Generate a fresh, high-value math strategy article as structured JSON."

response_schema = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING"},
        "slug": {"type": "STRING"},
        "meta_description": {"type": "STRING"},
        "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
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
    "required": ["title", "slug", "meta_description", "tags", "content_markdown", "social_copy"]
}

print("Generating post with Gemini API...")
response = client.models.generate_content(
    model="gemini-3.6-flash",
    contents=user_prompt,
    config=types.GenerateContentConfig(
        system_instruction=system_prompt,
        response_mime_type="application/json",
        response_schema=response_schema,
        temperature=0.7,
    ),
)

data = json.loads(response.text)

# Sanitize slug & add metadata
slug = re.sub(r'[^a-zA-Z0-9-]', '', data["slug"].lower().replace(" ", "-"))
pub_date_iso = datetime.now(timezone.utc).isoformat()
pub_date_short = datetime.now(timezone.utc).strftime("%Y-%m-%d")

data["slug"] = slug
data["published_at"] = pub_date_iso

# -------------------------------------------------------------
# 2. Write Post JSON (For Your React App to consume)
# -------------------------------------------------------------
json_dir = os.path.join("src", "content", "blog")
os.makedirs(json_dir, exist_ok=True)
json_file_path = os.path.join(json_dir, f"{slug}.json")

with open(json_file_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print(f" Saved JSON: {json_file_path}")

# -------------------------------------------------------------
# 3. Update public/sitemap.xml
# -------------------------------------------------------------
public_dir = "public"
os.makedirs(public_dir, exist_ok=True)
sitemap_path = os.path.join(public_dir, "sitemap.xml")

post_url = f"{BASE_URL}/blog/{slug}"
ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
ET.register_namespace("", ns)

if os.path.exists(sitemap_path):
    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
    except ET.ParseError:
        root = ET.Element(f"{{{ns}}}urlset")
else:
    root = ET.Element(f"{{{ns}}}urlset")
    # Add homepage if creating new sitemap
    home_url = ET.SubElement(root, f"{{{ns}}}url")
    ET.SubElement(home_url, f"{{{ns}}}loc").text = f"{BASE_URL}/"
    ET.SubElement(home_url, f"{{{ns}}}priority").text = "1.0"

# Check if URL already exists; update or append
existing = None
for url_elem in root.findall(f"{{{ns}}}url"):
    loc = url_elem.find(f"{{{ns}}}loc")
    if loc is not None and loc.text == post_url:
        existing = url_elem
        break

if existing is None:
    new_url_elem = ET.SubElement(root, f"{{{ns}}}url")
    ET.SubElement(new_url_elem, f"{{{ns}}}loc").text = post_url
    ET.SubElement(new_url_elem, f"{{{ns}}}lastmod").text = pub_date_short
    ET.SubElement(new_url_elem, f"{{{ns}}}priority").text = "0.8"
else:
    lastmod = existing.find(f"{{{ns}}}lastmod")
    if lastmod is not None:
        lastmod.text = pub_date_short

# Format and write sitemap
rough_string = ET.tostring(root, "utf-8")
reparsed = minidom.parseString(rough_string)
with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write(reparsed.toprettyxml(indent="  "))
print(f" Updated Sitemap: {sitemap_path}")

# -------------------------------------------------------------
# 4. Generate Pre-Rendered Static HTML (For Crawlers & Social Bots)
# -------------------------------------------------------------
# Anything in public/ gets copied verbatim to dist/ by Vite,
# allowing Firebase Hosting to serve this full HTML instantly.
html_out_dir = os.path.join(public_dir, "blog", slug)
os.makedirs(html_out_dir, exist_ok=True)
html_file_path = os.path.join(html_out_dir, "index.html")

# Convert newlines to simple HTML paragraphs for pre-render fallback
paragraphs = "".join([f"<p>{line}</p>" for line in data["content_markdown"].split("\n\n") if line.strip()])

json_ld = json.dumps({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data["title"],
    "description": data["meta_description"],
    "datePublished": pub_date_iso,
    "author": {
        "@type": "Organization",
        "name": "Kibo Climb",
        "url": BASE_URL
    },
    "publisher": {
        "@type": "Organization",
        "name": "Kibo Climb",
        "logo": {
            "@type": "ImageObject",
            "url": f"{BASE_URL}/icons/icon-512.png"
        }
    },
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": post_url
    }
}, indent=2)

html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{data["title"]} | Kibo Climb</title>
  <meta name="description" content="{data["meta_description"]}" />
  <link rel="canonical" href="{post_url}" />

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{post_url}" />
  <meta property="og:title" content="{data["title"]}" />
  <meta property="og:description" content="{data["meta_description"]}" />
  <meta property="og:image" content="{BASE_URL}/icons/og-image.png" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="{post_url}" />
  <meta name="twitter:title" content="{data["title"]}" />
  <meta name="twitter:description" content="{data["meta_description"]}" />
  <meta name="twitter:image" content="{BASE_URL}/icons/og-image.png" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
{json_ld}
  </script>

  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 720px; margin: 0 auto; padding: 2rem 1rem; color: #222; }}
    h1 {{ line-height: 1.25; margin-bottom: 0.5rem; }}
    .date {{ color: #777; font-size: 0.9rem; margin-bottom: 2rem; }}
    a.home-link {{ text-decoration: none; color: #2563eb; display: inline-block; margin-bottom: 1.5rem; font-weight: 500; }}
  </style>
</head>
<body>
  <a href="/" class="home-link">← Back to Kibo Climb</a>
  <h1>{data["title"]}</h1>
  <div class="date">{pub_date_short}</div>
  <article>
    {paragraphs}
  </article>
</body>
</html>
"""

with open(html_file_path, "w", encoding="utf-8") as f:
    f.write(html_template)

print(f" Pre-rendered SEO HTML: {html_file_path}")
print(" Pipeline Complete.")
