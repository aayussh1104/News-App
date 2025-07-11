from flask import Flask, request, jsonify, send_from_directory
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline
from newspaper import Article
from flask_cors import CORS
from flask_caching import Cache
from dotenv import load_dotenv
import os
import torch
import re

# Load environment variables from .env file
load_dotenv()

# Get values from environment
MODEL_NAME = os.getenv("MODEL_NAME")
if not MODEL_NAME:
    raise EnvironmentError("MODEL_NAME is required but not set in the environment.")

CACHE_TIMEOUT = int(os.getenv("CACHE_TIMEOUT", 300))  # 5 minutes default

# Initialize Flask app
app = Flask(__name__, static_folder = "../Frontend/build", static_url_path = "/")
CORS(app)

# Flask-Caching configuration (SimpleCache for in-memory dev cache)
app.config['CACHE_TYPE'] = 'SimpleCache'  # For production, use 'RedisCache'
app.config['CACHE_DEFAULT_TIMEOUT'] = CACHE_TIMEOUT
cache = Cache(app)

# Device selection: GPU if available
device = 0 if torch.cuda.is_available() else -1

# Load summarization model from Hugging Face
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
summarizer = pipeline("summarization", model=model, tokenizer=tokenizer, device=device)

# Text cleaner
def clean_text(text):
    text = text.replace('\n', ' ').strip()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'Read more.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\[\d+\s*chars\]', '', text)
    text = re.sub(r'…', '.', text)               # replaces Unicode ellipsis
    return text.strip()

# Summarization route
@app.route('/summarize', methods=['POST'])
def summarize_article():
    data = request.get_json()
    url = data.get("url")
    content = data.get("content", "").strip()

    # caching --> storing data in cache
    cache_key = url + content
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
    fallback_text = clean_text(content)
    fallback_word_count = len(fallback_text.split())

    print("[FALLBACK CONTENT WORDS]:", fallback_word_count)
    print("[FALLBACK CLEANED CONTENT]:", fallback_text[:300])

    # Try summarizing fallback_text if it's long enough
    if fallback_text and fallback_word_count >= 20:
        try:
            summary = summarizer(fallback_text, max_length=80, min_length=20, do_sample=False)[0]['summary_text']
            result = {
                "summary": summary,
                "source": "fallback-summary"
            }
            cache.set(cache_key, result)
            return jsonify(result)
        except Exception as inner_e:
            print("[ERROR fallback summarizing]:", inner_e)

    # Final fallback: show cleaned content as-is
    if fallback_text and fallback_word_count >= 10:
        result = {
            "summary": fallback_text,
            "source": "fallback-raw",
            "note": "Original content shown (not summarized)"
        }
        cache.set(cache_key, result)
        return jsonify(result)

    return jsonify({"error": "No sufficient data to summarize"}), 400


@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


# Run the app
if __name__ == "__main__":
    app.run(debug=True, threaded=True)
