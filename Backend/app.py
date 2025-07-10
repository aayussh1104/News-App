from flask import Flask, request, jsonify, Response
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from newspaper import Article
from flask_cors import CORS
from flask_caching import Cache
import torch
import re
import requests
from urllib.parse import urlparse

app = Flask(__name__)
CORS(app)

# Flask-Caching configuration (SimpleCache for in-memory dev cache)
app.config['CACHE_TYPE'] = 'SimpleCache'  # For production, use 'RedisCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # 5 minutes cache timeout
cache = Cache(app)

# Device selection: GPU if available
device = 0 if torch.cuda.is_available() else -1

# Load summarization model
tokenizer = AutoTokenizer.from_pretrained("sshleifer/distilbart-cnn-12-6")
model = AutoModelForSeq2SeqLM.from_pretrained("sshleifer/distilbart-cnn-12-6")
summarizer = pipeline("summarization", model=model, tokenizer=tokenizer, device=device)

# Text cleaner
def clean_text(text):
    text = text.replace('\n', ' ').strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'Read more.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[\d+\s*chars\]', '', text)  # removes things like [954 chars]
    return text.strip()

@app.route('/summarize', methods=['POST'])
def summarize_article():
    data = request.get_json()
    url = data.get("url")
    content = data.get("content", "").strip()
    description = data.get("description", "").strip()

    # caching --> storing data in cache
    cache_key = url + content + description
    cached_result = cache.get(cache_key)
    if cached_result:
        print("[CACHE HIT]")
        return jsonify(cached_result)

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Scraping the article
    try:
        article = Article(url)
        article.download()
        article.parse()
        text = clean_text(article.text.strip())

        print("[SCRAPED TEXT WORDS]:", len(text.split()))
        if text and len(text.split()) >= 300:
            summary = summarizer(text, max_length=300, min_length=100, do_sample=False)[0]['summary_text']
            result = {
                "title": article.title,
                "summary": summary,
                "source": "article"
            }
            cache.set(cache_key, result)
            return jsonify(result)

    except Exception as e:
        print("[ERROR scraping]:", e)

    # Fallback if article scraping failed or text too short
    fallback_text = clean_text(f"{description}. {content}".strip())
    fallback_word_count = len(fallback_text.split())

    print("[FALLBACK TEXT WORDS]:", fallback_word_count)
    print("[FALLBACK TEXT]:", fallback_text[:300])

    if fallback_text and fallback_word_count >= 80:
        try:
            summary = summarizer(fallback_text, max_length=120, min_length=60, do_sample=False)[0]['summary_text']
            result = {
                "summary": summary,
                "source": "fallback-summary"
            }
            cache.set(cache_key, result)
            return jsonify(result)
        except Exception as inner_e:
            print("[ERROR fallback summarizing]:", inner_e)

    # Final fallback: return raw preview
    if fallback_text and fallback_word_count >= 10:
        result = {
            "summary": fallback_text,
            "source": "fallback-raw",
            "note": "Original preview shown (not summarized)"
        }
        cache.set(cache_key, result)
        return jsonify(result)

    return jsonify({"error": "No sufficient data to summarize"}), 400

# Proxy image route to bypass CORS
@app.route("/proxy-image")
def proxy_image():
    url = request.args.get("url")
    if not url:
        return "Missing image URL", 400

    # Optional domain filter
    allowed_domains = ["gnews.io", "cdn.gnews.io", "newsapi.org"]
    domain = urlparse(url).netloc
    if not any(domain.endswith(allowed) for allowed in allowed_domains):
        return "Blocked domain", 403

    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, headers=headers, timeout=5)
        return Response(resp.content, content_type=resp.headers.get("Content-Type", "image/jpeg"))
    except Exception as e:
        print("[IMAGE PROXY ERROR]:", e)
        return "Image fetch failed", 500

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
