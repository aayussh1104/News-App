from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from newspaper import Article
from dotenv import load_dotenv
import os
import re
import torch
from functools import lru_cache

# Load environment variables
load_dotenv()

# Get values from .env
MODEL_NAME = os.getenv("MODEL_NAME")
if not MODEL_NAME:
    raise EnvironmentError("MODEL_NAME is required but not set.")

CACHE_TIMEOUT = int(os.getenv("CACHE_TIMEOUT", 300))  # 5 minutes

app = Flask(__name__)
CORS(app)

# Caching config
app.config['CACHE_TYPE'] = 'SimpleCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = CACHE_TIMEOUT
cache = Cache(app)

# Select device
device = 0 if torch.cuda.is_available() else -1

# Lazy-load and cache the summarizer
@lru_cache(maxsize=1)
def get_summarizer():
    print("[LOADING MODEL INTO MEMORY...]")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
    return pipeline("summarization", model=model, tokenizer=tokenizer, device=device)

# Clean input text
def clean_text(text):
    text = text.replace('\n', ' ').strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'Read more.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[\d+\s*chars\]', '', text)
    text = re.sub(r'…', '.', text)
    return text.strip()

# Summarize API
@app.route('/summarize', methods=['POST'])
def summarize_article():
    data = request.get_json()
    url = data.get("url")
    content = data.get("content", "").strip()

    cache_key = url + content
    cached_result = cache.get(cache_key)
    if cached_result:
        print("[CACHE HIT]")
        return jsonify(cached_result)

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Try scraping article
    try:
        article = Article(url)
        article.download()
        article.parse()
        text = clean_text(article.text.strip())

        print("[SCRAPED WORDS]:", len(text.split()))
        if text and len(text.split()) >= 200:
            summarizer = get_summarizer()
            summary = summarizer(text, max_length=150, min_length=90, do_sample=False)[0]['summary_text']
            result = {
                "title": article.title,
                "summary": summary,
                "source": "article"
            }
            cache.set(cache_key, result)
            return jsonify(result)

    except Exception as e:
        print("[SCRAPING ERROR]:", e)

    # Fallback if scraping fails
    fallback_text = clean_text(content)
    word_count = len(fallback_text.split())

    print("[FALLBACK WORDS]:", word_count)
    if fallback_text and word_count >= 30:
        try:
            summarizer = get_summarizer()
            summary = summarizer(fallback_text, max_length=40, min_length=20, do_sample=False)[0]['summary_text']
            result = {
                "summary": summary,
                "source": "fallback-summary"
            }
            cache.set(cache_key, result)
            return jsonify(result)
        except Exception as e:
            print("[FALLBACK SUMMARIZATION ERROR]:", e)

    if fallback_text and word_count <= 30:
        result = {
            "summary": fallback_text,
            "source": "fallback-raw",
            "note": "Original content shown (not summarized)"
        }
        cache.set(cache_key, result)
        return jsonify(result)

    return jsonify({"error": "No sufficient data to summarize"}), 400

# Run Flask app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False, threaded=True)
