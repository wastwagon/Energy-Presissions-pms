#!/usr/bin/env python3
"""
Download all images from Energy Precisions website
Usage: python -m app.scripts.download_website_images
"""
import sys
import os
import requests
from pathlib import Path
from urllib.parse import urljoin, urlparse
import re
from bs4 import BeautifulSoup
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

WEBSITE_URL = "https://energyprecisions.com"
IMAGES_DIR = Path(__file__).parent.parent.parent / "frontend" / "public" / "website_images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def sanitize_filename(url):
    """Create a safe filename from URL"""
    parsed = urlparse(url)
    filename = Path(parsed.path).name
    if not filename or '.' not in filename:
        filename = "image.jpg"
    # Remove query parameters from filename
    filename = filename.split('?')[0]
    return filename

def download_image(url, filename):
    """Download an image from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, timeout=30, headers=headers, stream=True, allow_redirects=True)
        if response.status_code == 200:
            filepath = IMAGES_DIR / filename
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            print(f"  ✅ Downloaded: {filename}")
            return f"/website_images/{filename}"
    except Exception as e:
        print(f"  ⚠️  Failed to download {url}: {e}")
    return None

def extract_and_download_images():
    """Extract and download all images from the website"""
    print(f"🌐 Fetching content from {WEBSITE_URL}...")
    
    try:
        response = requests.get(WEBSITE_URL, timeout=30, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
    except Exception as e:
        print(f"❌ Error fetching website: {e}")
        return []
    
    downloaded_images = []
    seen_urls = set()
    
    # Find all img tags
    img_tags = soup.find_all('img')
    print(f"\n📸 Found {len(img_tags)} <img> tags. Processing...")
    
    for idx, img in enumerate(img_tags):
        # Try multiple src attributes
        src = (img.get('src') or 
               img.get('data-src') or 
               img.get('data-lazy-src') or
               img.get('data-original'))
        
        if not src:
            continue
        
        # Skip data URIs, external CDNs, and already seen URLs
        if (src.startswith('data:') or 
            'gravatar' in src.lower() or 
            'avatar' in src.lower() or
            src in seen_urls):
            continue
        
        seen_urls.add(src)
        
        # Get full URL
        full_url = urljoin(WEBSITE_URL, src)
        
        # Generate filename
        filename = sanitize_filename(full_url)
        if not filename or filename == 'image.jpg':
            # Create unique filename
            ext = Path(urlparse(full_url).path).suffix or '.jpg'
            filename = f"image_{idx+1}{ext}"
        
        # Ensure unique filename
        base_name = Path(filename).stem
        ext = Path(filename).suffix
        counter = 1
        original_filename = filename
        while (IMAGES_DIR / filename).exists():
            filename = f"{base_name}_{counter}{ext}"
            counter += 1
        
        # Download image
        local_path = download_image(full_url, filename)
        if local_path:
            downloaded_images.append({
                "original_url": full_url,
                "local_path": local_path,
                "filename": filename,
                "alt": img.get('alt', ''),
                "class": img.get('class', [])
            })
    
    # Also check for background images in inline styles and CSS
    print("\n🔍 Checking for background images...")
    
    # Check inline styles
    elements_with_bg = soup.find_all(style=re.compile(r'background.*url', re.I))
    for element in elements_with_bg:
        style = element.get('style', '')
        urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', style)
        for url in urls:
            if url.startswith('http') or url.startswith('//'):
                full_url = urljoin(WEBSITE_URL, url)
                if full_url not in seen_urls:
                    seen_urls.add(full_url)
                    filename = sanitize_filename(full_url)
                    if not filename or filename == 'image.jpg':
                        filename = f"bg_{len(downloaded_images)+1}{Path(urlparse(full_url).path).suffix or '.jpg'}"
                    local_path = download_image(full_url, filename)
                    if local_path:
                        downloaded_images.append({
                            "original_url": full_url,
                            "local_path": local_path,
                            "filename": filename,
                            "alt": "Background image",
                            "type": "background"
                        })
    
    # Check CSS files
    link_tags = soup.find_all('link', rel='stylesheet')
    for link in link_tags:
        css_url = urljoin(WEBSITE_URL, link.get('href', ''))
        if css_url and css_url.endswith('.css'):
            try:
                css_response = requests.get(css_url, timeout=10, headers={
                    'User-Agent': 'Mozilla/5.0'
                })
                if css_response.status_code == 200:
                    urls = re.findall(r'url\(["\']?([^"\')]+)["\']?\)', css_response.text)
                    for url in urls:
                        if url.startswith('http') or (not url.startswith('data:') and '.' in url):
                            full_url = urljoin(css_url, url)
                            if full_url not in seen_urls and any(ext in full_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']):
                                seen_urls.add(full_url)
                                filename = sanitize_filename(full_url)
                                if not filename or filename == 'image.jpg':
                                    filename = f"css_bg_{len(downloaded_images)+1}{Path(urlparse(full_url).path).suffix or '.jpg'}"
                                local_path = download_image(full_url, filename)
                                if local_path:
                                    downloaded_images.append({
                                        "original_url": full_url,
                                        "local_path": local_path,
                                        "filename": filename,
                                        "alt": "CSS background image",
                                        "type": "css_background"
                                    })
            except:
                pass
    
    # Save image manifest
    manifest_file = Path(__file__).parent.parent.parent / "website_content" / "images_manifest.json"
    manifest_file.parent.mkdir(exist_ok=True)
    with open(manifest_file, 'w') as f:
        json.dump(downloaded_images, f, indent=2)
    
    print(f"\n✅ Downloaded {len(downloaded_images)} images to {IMAGES_DIR}")
    print(f"✅ Image manifest saved to {manifest_file}")
    
    return downloaded_images

if __name__ == "__main__":
    images = extract_and_download_images()
    print(f"\n📊 Summary: {len(images)} images downloaded and ready to use")
