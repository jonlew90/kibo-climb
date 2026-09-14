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

# -------------------------------------------------------------
# 1. System Prompt & High-Intent Structured Generation
# -------------------------------------------------------------
system_prompt = """
You are an expert educational writer and SEO strategist for Kibo Climb, an adaptive math learning app.
Write an engaging, authoritative 600-word article focusing on a specific, high-intent math topic (mental math shortcuts, fraction strategies, tackling math anxiety, or gamified mastery).

SEO & Content Rules:
- Structure with clear Markdown headers (## for main sections, ### for sub-steps). Do not use em dashes anywhere.
- Include concrete, step-by-step worked numerical examples.
- Naturally weave in mentions of how climbing Mount Kilimanjaro with Kibo the red panda turns repetitive math practice into an adventure.
- Keep the tone encouraging, clear, and actionable for parents, teachers, and upper elementary students.
- Choose the single best featured_asset from the allowed list that visually complements the article topic.
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
            "enum": ["kibo-summit.png", "kibo-thinking.png", "kibo-climbing.png"]
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

# Sanitize slug & add timestamps
slug = re.sub(r'[^a-zA-Z0-9-]', '', data["slug"].lower().replace(" ", "-"))
pub_date_iso = datetime.now(timezone.utc).isoformat()
pub_date_short = datetime.now(timezone.utc).strftime("%Y-%m-%d")

data["slug"] = slug
data["published_at"] = pub_date_iso

# -------------------------------------------------------------
# 2. Write Post JSON (For Client PWA / React Consumer)
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
    home_url = ET.SubElement(root, f"{{{ns}}}url")
    ET.SubElement(home_url, f"{{{ns}}}loc").text = f"{BASE_URL}/"
    ET.SubElement(home_url, f"{{{ns}}}priority").text = "1.0"

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

rough_string = ET.tostring(root, "utf-8")
reparsed = minidom.parseString(rough_string)
with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write(reparsed.toprettyxml(indent="  "))
print(f" Updated Sitemap: {sitemap_path}")

# -------------------------------------------------------------
# 4. Generate Pre-Rendered Branded HTML (For Crawlers & Direct Hits)
# -------------------------------------------------------------
html_out_dir = os.path.join(public_dir, "blog", slug)
os.makedirs(html_out_dir, exist_ok=True)
html_file_path = os.path.join(html_out_dir, "index.html")

# Format paragraphs from markdown for the static crawler view
paragraphs = "".join([f"<p>{line}</p>" for line in data["content_markdown"].split("\n\n") if line.strip()])

# Featured image resolution
featured_filename = data.get("featured_asset", "kibo-climbing.png")
featured_image_url = f"{BASE_URL}/images/blog/{featured_filename}"

json_ld = json.dumps({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": data["title"],
    "description": data["meta_description"],
    "image": featured_image_url,
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
  <meta property="og:image" content="{featured_image_url}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="{post_url}" />
  <meta name="twitter:title" content="{data["title"]}" />
  <meta name="twitter:description" content="{data["meta_description"]}" />
  <meta name="twitter:image" content="{featured_image_url}" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
{json_ld}
  </script>

  <style>
    :root {{
      --primary: #e0533c;
      --primary-dark: #c23d28;
      --bg: #fffbf9;
      --text: #2d3748;
      --card-bg: #ffffff;
      --border: #f0e6e2;
    }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.7;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 0;
    }}
    .nav-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 780px;
      margin: 0 auto;
      padding: 1.25rem 1rem;
    }}
    .nav-logo {{
      font-weight: 800;
      color: var(--primary);
      text-decoration: none;
      font-size: 1.2rem;
    }}
    .nav-cta {{
      background: var(--primary);
      color: white;
      padding: 0.5rem 1.2rem;
      border-radius: 9999px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s ease;
    }}
    .nav-cta:hover {{ background: var(--primary-dark); }}
    .article-container {{
      max-width: 720px;
      margin: 0 auto;
      padding: 1rem 1rem 4rem 1rem;
    }}
    .hero-img {{
      width: 100%;
      max-height: 360px;
      object-fit: cover;
      border-radius: 16px;
      margin: 1.5rem 0;
      background-color: #f7fafc;
    }}
    h1 {{ font-size: 2.2rem; line-height: 1.25; margin-bottom: 0.5rem; color: #1a202c; }}
    .date {{ color: #718096; font-size: 0.9rem; margin-bottom: 1.5rem; }}
    article p {{ margin-bottom: 1.25rem; }}
    article h2 {{ margin-top: 2rem; color: #1a202c; }}
    article h3 {{ margin-top: 1.5rem; color: #2d3748; }}
    .cta-card {{
      background: var(--card-bg);
      border: 2px solid var(--border);
      border-radius: 16px;
      padding: 2.25rem 2rem;
      margin-top: 3.5rem;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }}
    .cta-card h3 {{ margin-top: 0; font-size: 1.45rem; color: #1a202c; }}
    .cta-card p {{ color: #4a5568; max-width: 540px; margin: 0.75rem auto 1.5rem auto; }}
    .cta-button {{
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 0.85rem 2.2rem;
      border-radius: 12px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s ease;
    }}
    .cta-button:hover {{ background: var(--primary-dark); }}
  </style>
</head>
<body>
  <nav class="nav-bar">
    <a href="/" class="nav-logo">🐾 Kibo Climb</a>
    <a href="/" class="nav-cta">Play Free</a>
  </nav>

  <main class="article-container">
    <h1>{data["title"]}</h1>
    <div class="date">Published {pub_date_short} • Adaptive Math Strategies</div>
    
    <img src="{featured_image_url}" alt="{data['title']}" class="hero-img" />

    <article>
      {paragraphs}
    </article>

    <section class="cta-card">
      <h3>Turn Math Practice Into a Mountain Adventure</h3>
      <p>Help Kibo summit Mount Kilimanjaro by tackling mental math shortcuts, adaptive levels, and skill-building challenges tailored directly to your student.</p>
      <a href="/" class="cta-button">Start the Climb - Free to Play</a>
    </section>
  </main>
</body>
</html>
"""

with open(html_file_path, "w", encoding="utf-8") as f:
    f.write(html_template)

print(f" Pre-rendered SEO HTML: {html_file_path}")
print(" Pipeline Complete.")
