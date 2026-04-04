from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import json, os, random, datetime, uuid
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Allow cross-origin for dev

# ─── Path Config ───────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(__file__)
DATA_DIR       = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR    = os.path.join(BASE_DIR, 'uploads')
RECORDINGS_DIR = os.path.join(BASE_DIR, 'recordings')

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(RECORDINGS_DIR, exist_ok=True)

ALLOWED_TEXT  = {'txt'}
ALLOWED_AUDIO = {'wav', 'webm', 'ogg', 'mp3'}

# ─── Helpers ───────────────────────────────────────────────────────────────────
def load_json(filename: str) -> dict:
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filename: str, data: dict) -> None:
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def allowed_file(filename: str, allowed: set) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed

def error(msg: str, code: int = 400):
    return jsonify({'error': msg}), code

# ─── Main Route ────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    """Serve the single-page application."""
    return render_template('index.html')

# ─── Tongue Twister Routes ─────────────────────────────────────────────────────
@app.route('/api/tongue-twisters', methods=['GET'])
def get_tongue_twisters():
    """Return all tongue twisters grouped by category."""
    return jsonify(load_json('tongue_twisters.json'))


@app.route('/api/tongue-twisters/session', methods=['GET'])
def get_twister_session():
    """
    Return a session of 5 tongue twisters.
    Query params:
      category: communication | technical | tricky_fun | all (default: all)
      count:    number of twisters (default: 5, max: 10)
    """
    category = request.args.get('category', 'all')
    count    = min(int(request.args.get('count', 5)), 10)
    data     = load_json('tongue_twisters.json')

    if category == 'all':
        pool = [t for cat in data.values() for t in cat]
    elif category in data:
        pool = data[category]
    else:
        return error('Invalid category. Choose: communication, technical, tricky_fun, or all')

    session = random.sample(pool, min(count, len(pool)))
    return jsonify({'session': session, 'total': len(session), 'category': category})


# ─── Paragraph Routes ──────────────────────────────────────────────────────────
@app.route('/api/paragraphs', methods=['GET'])
def get_paragraphs():
    """Return all paragraphs grouped by difficulty."""
    return jsonify(load_json('paragraphs.json'))


@app.route('/api/paragraphs/random', methods=['GET'])
def get_random_paragraph():
    """
    Return a random paragraph.
    Query params: difficulty = easy | medium | hard (default: medium)
    """
    difficulty = request.args.get('difficulty', 'medium')
    data = load_json('paragraphs.json')

    if difficulty not in data:
        return error('Invalid difficulty. Choose: easy, medium, or hard')

    paragraph = random.choice(data[difficulty])
    return jsonify(paragraph)


# ─── Daily Challenge ───────────────────────────────────────────────────────────
@app.route('/api/daily-challenge', methods=['GET'])
def get_daily_challenge():
    """
    Return a seeded daily challenge (same for all users on same date).
    Includes one tongue twister + one paragraph.
    """
    today = datetime.date.today()
    seed  = int(today.strftime('%Y%m%d'))
    rng   = random.Random(seed)  # Isolated RNG so global state isn't affected

    tt_data   = load_json('tongue_twisters.json')
    para_data = load_json('paragraphs.json')

    all_twisters = [t for cat in tt_data.values() for t in cat]
    twister   = rng.choice(all_twisters)
    paragraph = rng.choice(para_data['medium'])

    return jsonify({
        'date':          today.isoformat(),
        'display_date':  today.strftime('%B %d, %Y'),
        'tongue_twister': twister,
        'paragraph':      paragraph
    })


# ─── File Upload ───────────────────────────────────────────────────────────────
@app.route('/api/upload-text', methods=['POST'])
def upload_text():
    """
    Accept a .txt file upload for custom paragraph reading.
    Returns the file content and metadata.
    """
    if 'file' not in request.files:
        return error('No file field in request')

    file = request.files['file']
    if not file.filename:
        return error('No file selected')

    if not allowed_file(file.filename, ALLOWED_TEXT):
        return error('Only .txt files are supported')

    filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
    filepath = os.path.join(UPLOADS_DIR, filename)
    file.save(filepath)

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read().strip()

    word_count = len(content.split())
    wpm        = {'slow': 80, 'medium': 130, 'fast': 200}

    return jsonify({
        'success':        True,
        'filename':       filename,
        'content':        content,
        'word_count':     word_count,
        'estimated_minutes': {
            speed: round(word_count / wpm[speed], 1)
            for speed in wpm
        }
    })


# ─── Scores / Leaderboard ─────────────────────────────────────────────────────
@app.route('/api/scores', methods=['GET', 'POST'])
def scores():
    """GET → leaderboard top 20 | POST → save a new score."""
    data = load_json('scores.json')

    if request.method == 'POST':
        body = request.get_json(silent=True) or {}
        entry = {
            'id':            str(uuid.uuid4()),
            'username':      body.get('username', 'Anonymous')[:30],
            'module':        body.get('module'),          # tongue_twister | paragraph
            'accuracy':      round(float(body.get('accuracy', 0)), 2),
            'wpm':           round(float(body.get('wpm', 0)), 1),
            'speed_setting': body.get('speed_setting'),   # slow | medium | fast
            'speed_feedback':body.get('speed_feedback'),  # Optimal | Too Slow | Too Fast
            'timestamp':     datetime.datetime.now().isoformat(),
            'details':       body.get('details', {})
        }
        data['scores'].append(entry)
        save_json('scores.json', data)
        return jsonify({'success': True, 'id': entry['id']}), 201

    # GET — leaderboard
    sorted_scores = sorted(data['scores'], key=lambda x: x.get('accuracy', 0), reverse=True)
    return jsonify({'leaderboard': sorted_scores[:20], 'total': len(data['scores'])})


@app.route('/api/scores/history', methods=['GET'])
def score_history():
    """Return last 10 scores for a given username."""
    username = request.args.get('username', 'Anonymous')
    data     = load_json('scores.json')
    history  = [s for s in data['scores'] if s.get('username') == username]
    return jsonify({'history': history[-10:], 'username': username})


# ─── Audio Handling ────────────────────────────────────────────────────────────
@app.route('/api/audio', methods=['POST'])
def save_audio():
    """Accept and store a recorded audio file."""
    if 'audio' not in request.files:
        return error('No audio field in request')

    audio_file = request.files['audio']
    ext        = 'webm'  # MediaRecorder default
    filename   = f"rec_{uuid.uuid4()}.{ext}"
    filepath   = os.path.join(RECORDINGS_DIR, filename)
    audio_file.save(filepath)

    return jsonify({'success': True, 'filename': filename}), 201


@app.route('/api/recordings/<path:filename>', methods=['GET'])
def get_recording(filename):
    """Serve a stored audio recording."""
    return send_from_directory(RECORDINGS_DIR, filename)


# ─── Healthcheck ───────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.datetime.now().isoformat()})


if __name__ == '__main__':
    print("🎤  Speech Fluency Trainer — http://localhost:5000")
    app.run(debug=True, port=5000)
