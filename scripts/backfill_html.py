import os
import json
import xml.etree.ElementTree as ET
from xml.dom import minidom

BASE_URL = "https://kiboclimb.com"
json_dir = os.path.join("src", "content", "blog")
public_dir = "public"

if not os.path.exists(json_dir):
    print("No blog directory found.")
    exit()

# -------------------------------------------------------------
# 1. Load or initialize sitemap.xml
# -------------------------------------------------------------
sitemap_path = os.path.join(public_dir, "sitemap.xml")
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

# -------------------------------------------------------------
# 2. Iterate through all JSON files in src/content/blog/
# -------------------------------------------------------------
for filename in os.listdir(json_dir):
    if not filename.endswith(".json"):
        continue

    file_path = os.path.join(json_dir, filename)
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    slug = data.get("slug", filename.replace(".json", ""))
    pub_date_iso = data.get("published_at", "2026-09-14T00:00:00Z")
    pub_date_short = pub_date_iso[:10]
    post_url = f"{BASE_URL}/blog/{slug}"

    # Generate HTML file
    html_out_dir = os.path.join(public_dir, "blog", slug)
    os.makedirs(html_out_dir, exist_ok=True)
    html_file_path = os.path.join(html_out_dir, "index.html")

    paragraphs = "".join([f"<p>{line}</p>" for line in data.get("content_markdown", "").split("\n\n") if line.strip()])
    featured_filename = data.get("featured_asset", "kibo-climbing.jpeg")
    featured_image_url = f"{BASE_URL}/images/blog/{featured_filename}"

    json_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": data.get("title", ""),
        "description": data.get("meta_description", data.get("summary", "")),
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

    meta_desc = data.get("meta_description", data.get("summary", ""))

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{data.get("title", "")} | Kibo Climb</title>
  <meta name="description" content="{meta_desc}" />
  <link rel="canonical" href="{post_url}" />

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{post_url}" />
  <meta property="og:title" content="{data.get("title", "")}" />
  <meta property="og:description" content="{meta_desc}" />
  <meta property="og:image" content="{featured_image_url}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="{post_url}" />
  <meta name="twitter:title" content="{data.get("title", "")}" />
  <meta name="twitter:description" content="{meta_desc}" />
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
    <h1>{data.get("title", "")}</h1>
    <div class="date">Published {pub_date_short} • Adaptive Math Strategies</div>
    
    <img src="{featured_image_url}" alt="{data.get('title', '')}" class="hero-img" />

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
    print(f"Generated HTML for: {slug} -> {html_file_path}")

    # Append to sitemap if not present
    existing = False
    for url_elem in root.findall(f"{{{ns}}}url"):
        loc = url_elem.find(f"{{{ns}}}loc")
        if loc is not None and loc.text == post_url:
            existing = True
            break

    if not existing:
        new_url_elem = ET.SubElement(root, f"{{{ns}}}url")
        ET.SubElement(new_url_elem, f"{{{ns}}}loc").text = post_url
        ET.SubElement(new_url_elem, f"{{{ns}}}lastmod").text = pub_date_short
        ET.SubElement(new_url_elem, f"{{{ns}}}priority").text = "0.8"

# Write updated sitemap
rough_string = ET.tostring(root, "utf-8")
reparsed = minidom.parseString(rough_string)
with open(sitemap_path, "w", encoding="utf-8") as f:
    f.write(reparsed.toprettyxml(indent="  "))
print(f"Updated sitemap at {sitemap_path}")
