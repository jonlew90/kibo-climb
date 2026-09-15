import html
import json
import os
import re
import xml.etree.ElementTree as ET

BASE_URL = "https://kiboclimb.com"
BLOG_JSON_DIR = os.path.join("src", "content", "blog")
PUBLIC_DIR = "public"
SITEMAP_PATH = os.path.join(PUBLIC_DIR, "sitemap.xml")


def _format_inline(text: str) -> str:
    """Escapes HTML entities and applies basic bold formatting."""
    safe_text = html.escape(text.strip())
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", safe_text)


def markdown_to_html(md_text: str) -> str:
    """Converts basic markdown headers, lists, bold text, and paragraphs into semantic HTML."""
    blocks = [b.strip() for b in md_text.strip().split("\n\n") if b.strip()]
    html_parts = []

    for block in blocks:
        lines = [line.strip() for line in block.split("\n") if line.strip()]
        if not lines:
            continue

        first_line = lines[0]

        if first_line.startswith("### "):
            heading_text = _format_inline(first_line[4:])
            html_parts.append(f"<h3>{heading_text}</h3>")
            for sub_line in lines[1:]:
                html_parts.append(f"<p>{_format_inline(sub_line)}</p>")

        elif first_line.startswith("## "):
            heading_text = _format_inline(first_line[3:])
            html_parts.append(f"<h2>{heading_text}</h2>")
            for sub_line in lines[1:]:
                html_parts.append(f"<p>{_format_inline(sub_line)}</p>")

        elif re.match(r"^\d+\.\s", first_line):
            items = []
            for l in lines:
                item_text = re.sub(r"^\d+\.\s*", "", l)
                items.append(f"<li>{_format_inline(item_text)}</li>")
            html_parts.append(f"<ol>{''.join(items)}</ol>")

        elif first_line.startswith("- ") or first_line.startswith("* "):
            items = []
            for l in lines:
                item_text = re.sub(r"^[-*]\s*", "", l)
                items.append(f"<li>{_format_inline(item_text)}</li>")
            html_parts.append(f"<ul>{''.join(items)}</ul>")

        else:
            text = " ".join(lines)
            html_parts.append(f"<p>{_format_inline(text)}</p>")

    return "\n      ".join(html_parts)


def generate_post_html(data: dict) -> str:
    """Renders a single blog post into full static HTML."""
    slug = data["slug"]
    title = data["title"]
    meta_description = data.get("meta_description") or data.get("summary", "")
    published_at = data.get("published_at", "")
    pub_date_short = published_at[:10] if len(published_at) >= 10 else "2026-09-14"

    featured_filename = data.get("featured_asset", "kibo-climbing.jpeg")
    featured_image_url = f"{BASE_URL}/images/blog/{featured_filename}"
    post_url = f"{BASE_URL}/blog/{slug}"

    content_html = markdown_to_html(data.get("content_markdown", ""))

    json_ld = json.dumps({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": meta_description,
        "image": featured_image_url,
        "datePublished": published_at,
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

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{html.escape(title)} | Kibo Climb</title>
  <meta name="description" content="{html.escape(meta_description)}" />
  <link rel="canonical" href="{post_url}" />

  <!-- Google Analytics 4 (COPPA Compliant) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-PNQ5D8DFHP"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('consent', 'default', {{
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'granted'
    }});
    gtag('set', {{
      'restricted_data_processing': true,
      'allow_google_signals': false,
      'allow_ad_personalization_signals': false
    }});
    gtag('js', new Date());
    gtag('config', 'G-PNQ5D8DFHP');
  </script>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">

  <!-- Shared Blog Stylesheet -->
  <link rel="stylesheet" href="/css/blog.css" />

  <!-- Open Graph / Facebook / LinkedIn -->
  <meta property="og:type" content="article" />
  <meta property="og:url" content="{post_url}" />
  <meta property="og:title" content="{html.escape(title)}" />
  <meta property="og:description" content="{html.escape(meta_description)}" />
  <meta property="og:image" content="{featured_image_url}" />

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="{post_url}" />
  <meta name="twitter:title" content="{html.escape(title)}" />
  <meta name="twitter:description" content="{html.escape(meta_description)}" />
  <meta name="twitter:image" content="{featured_image_url}" />

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
{json_ld}
  </script>
</head>
<body>
  <nav class="nav-bar">
    <a href="/" class="nav-logo"><img src="/favicon.svg" alt="Kibo" width="28" height="28" /> Kibo Climb</a>
    <a href="/" class="nav-cta">Play Free</a>
  </nav>

  <main class="article-container">
    <h1>{html.escape(title)}</h1>
    <div class="date">Published {pub_date_short} • Adaptive Math Strategies</div>
    
    <img src="{featured_image_url}" alt="{html.escape(title)}" class="hero-img" />

    <article>
      {content_html}
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


def update_sitemap(posts: list[dict]):
    """Updates public/sitemap.xml with strictly fixed publication dates."""
    ns = "http://www.sitemaps.org/schemas/sitemap/0.9"
    ET.register_namespace("", ns)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    if os.path.exists(SITEMAP_PATH):
        try:
            tree = ET.parse(SITEMAP_PATH)
            root = tree.getroot()
        except ET.ParseError:
            root = ET.Element(f"{{{ns}}}urlset")
    else:
        root = ET.Element(f"{{{ns}}}urlset")

    home_found = False
    for url_elem in root.findall(f"{{{ns}}}url"):
        loc = url_elem.find(f"{{{ns}}}loc")
        if loc is not None and loc.text == f"{BASE_URL}/":
            home_found = True
            break

    if not home_found:
        home_url = ET.Element(f"{{{ns}}}url")
        ET.SubElement(home_url, f"{{{ns}}}loc").text = f"{BASE_URL}/"
        ET.SubElement(home_url, f"{{{ns}}}priority").text = "1.0"
        root.insert(0, home_url)

    existing_url_map = {}
    for url_elem in root.findall(f"{{{ns}}}url"):
        loc = url_elem.find(f"{{{ns}}}loc")
        if loc is not None and loc.text:
            existing_url_map[loc.text] = url_elem

    for post in posts:
        slug = post["slug"]
        post_url = f"{BASE_URL}/blog/{slug}"
        published_at = post.get("published_at", "")
        pub_date_short = published_at[:10] if len(published_at) >= 10 else "2026-09-14"

        if post_url in existing_url_map:
            url_elem = existing_url_map[post_url]
            lastmod = url_elem.find(f"{{{ns}}}lastmod")
            if lastmod is not None:
                lastmod.text = pub_date_short
            else:
                ET.SubElement(url_elem, f"{{{ns}}}lastmod").text = pub_date_short
        else:
            new_url_elem = ET.SubElement(root, f"{{{ns}}}url")
            ET.SubElement(new_url_elem, f"{{{ns}}}loc").text = post_url
            ET.SubElement(new_url_elem, f"{{{ns}}}lastmod").text = pub_date_short
            ET.SubElement(new_url_elem, f"{{{ns}}}priority").text = "0.8"

    def clean_elem(elem):
        if elem.text:
            elem.text = elem.text.strip() or None
        if elem.tail:
            elem.tail = elem.tail.strip() or None
        for child in elem:
            clean_elem(child)

    clean_elem(root)
    ET.indent(root, space="  ")
    xml_content = '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding="utf-8").decode("utf-8") + '\n'
    with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
        f.write(xml_content)
    print(f"Synchronized Sitemap with {len(posts)} posts: {SITEMAP_PATH}")


def build_all():
    """Iterates over all blog JSON files, renders HTML pages, and syncs sitemap.xml."""
    if not os.path.exists(BLOG_JSON_DIR):
        print(f"Directory {BLOG_JSON_DIR} does not exist. Nothing to build.")
        return

    json_files = [f for f in os.listdir(BLOG_JSON_DIR) if f.endswith(".json")]
    if not json_files:
        print(f"No blog posts found in {BLOG_JSON_DIR}.")
        return

    posts = []
    for filename in sorted(json_files):
        filepath = os.path.join(BLOG_JSON_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not data.get("slug"):
            continue

        slug = data["slug"]
        html_out_dir = os.path.join(PUBLIC_DIR, "blog", slug)
        os.makedirs(html_out_dir, exist_ok=True)
        html_file_path = os.path.join(html_out_dir, "index.html")

        html_content = generate_post_html(data)
        with open(html_file_path, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"Rendered HTML: {html_file_path}")
        posts.append(data)

    update_sitemap(posts)
    print(f"Successfully built {len(posts)} static blog posts.")


if __name__ == "__main__":
    build_all()
