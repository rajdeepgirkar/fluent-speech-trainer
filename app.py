from flask import Flask, request, jsonify, send_from_directory, render_template, redirect, url_for
from flask_cors import CORS
import json, os, re, random, datetime, uuid, statistics
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# ─── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
DATA_DIR       = os.path.join(BASE_DIR, 'data')
UPLOADS_DIR    = os.path.join(BASE_DIR, 'uploads')
RECORDINGS_DIR = os.path.join(BASE_DIR, 'recordings')

os.makedirs(UPLOADS_DIR,    exist_ok=True)
os.makedirs(RECORDINGS_DIR, exist_ok=True)

ALLOWED_TEXT  = {'txt'}
ALLOWED_AUDIO = {'wav', 'webm', 'ogg', 'mp3'}

# WPM targets (updated per review)
WPM_TARGETS = {'slow': 50, 'medium': 100, 'fast': 150}

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

def strip_numbers(text: str) -> str:
    """Remove standalone digit sequences from text, preserve words."""
    # Remove digit-only tokens but keep alphanumeric words like 'B2B'
    text = re.sub(r'\b\d+\b', '', text)
    # Collapse multiple spaces
    text = re.sub(r'  +', ' ', text).strip()
    return text

# ─── Page Routes ───────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/tongue-twister')
def tongue_twister():
    return render_template('tongue_twister.html')

@app.route('/paragraph')
def paragraph():
    return render_template('paragraph.html')

@app.route('/leaderboard')
def leaderboard_page():
    return render_template('leaderboard.html')

@app.route('/daily-challenge')
def daily_challenge_page():
    return render_template('daily_challenge.html')

@app.route('/dashboard')
def dashboard_page():
    return render_template('dashboard.html')

# ─── Tongue Twister API ────────────────────────────────────────────────────────
@app.route('/api/tongue-twisters', methods=['GET'])
def get_tongue_twisters():
    return jsonify(load_json('tongue_twisters.json'))

@app.route('/api/tongue-twisters/session', methods=['GET'])
def get_twister_session():
    """
    Returns a randomized session of tongue twisters.
    ?category=communication|technical|tricky_fun|all  &count=5
    """
    category = request.args.get('category', 'all')
    count    = min(int(request.args.get('count', 5)), 10)
    data     = load_json('tongue_twisters.json')

    if category == 'all':
        pool = [t for cat in data.values() for t in cat]
    elif category in data:
        pool = data[category]
    else:
        return error('Invalid category')

    session = random.sample(pool, min(count, len(pool)))
    return jsonify({'session': session, 'total': len(session), 'category': category})

# ─── Paragraph API ─────────────────────────────────────────────────────────────
@app.route('/api/paragraphs', methods=['GET'])
def get_paragraphs():
    return jsonify(load_json('paragraphs.json'))

@app.route('/api/paragraphs/random', methods=['GET'])
def get_random_paragraph():
    difficulty = request.args.get('difficulty', 'medium')
    data = load_json('paragraphs.json')
    if difficulty not in data:
        return error('Invalid difficulty')
    paragraph = random.choice(data[difficulty])
    return jsonify(paragraph)

# ─── Daily Challenge API ───────────────────────────────────────────────────────
@app.route('/api/daily-challenge', methods=['GET'])
def get_daily_challenge():
    today = datetime.date.today()
    seed  = int(today.strftime('%Y%m%d'))
    rng   = random.Random(seed)

    tt_data   = load_json('tongue_twisters.json')
    para_data = load_json('paragraphs.json')

    all_twisters = [t for cat in tt_data.values() for t in cat]
    twister   = rng.choice(all_twisters)
    paragraph = rng.choice(para_data['medium'])

    return jsonify({
        'date':           today.isoformat(),
        'display_date':   today.strftime('%B %d, %Y'),
        'day_of_week':    today.strftime('%A'),
        'tongue_twister': twister,
        'paragraph':      paragraph,
    })

# ─── File Upload API ───────────────────────────────────────────────────────────
@app.route('/api/upload-text', methods=['POST'])
def upload_text():
    """
    Accept a .txt file.
    Strips standalone digit sequences from content before returning.
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
        raw_content = f.read().strip()

    # Strip standalone numbers (review requirement)
    content    = strip_numbers(raw_content)
    word_count = len(content.split())

    return jsonify({
        'success':    True,
        'filename':   filename,
        'content':    content,
        'word_count': word_count,
        'original_word_count': len(raw_content.split()),
        'estimated_minutes': {
            speed: round(word_count / wpm, 1)
            for speed, wpm in WPM_TARGETS.items()
        }
    })

# ─── Scores / Leaderboard API ──────────────────────────────────────────────────
@app.route('/api/scores', methods=['GET', 'POST'])
def scores():
    """GET → top-20 leaderboard | POST → save score"""
    data = load_json('scores.json')

    if request.method == 'POST':
        body  = request.get_json(silent=True) or {}
        entry = {
            'id':            str(uuid.uuid4()),
            'username':      body.get('username', 'Anonymous')[:30],
            'module':        body.get('module'),
            'accuracy':      round(float(body.get('accuracy', 0)), 2),
            'wpm':           round(float(body.get('wpm', 0)), 1),
            'speed_setting': body.get('speed_setting'),
            'speed_feedback':body.get('speed_feedback'),
            'timestamp':     datetime.datetime.now().isoformat(),
            'details':       body.get('details', {}),
        }
        data['scores'].append(entry)
        save_json('scores.json', data)
        return jsonify({'success': True, 'id': entry['id']}), 201

    sorted_scores = sorted(data['scores'], key=lambda x: x.get('accuracy', 0), reverse=True)
    return jsonify({'leaderboard': sorted_scores[:20], 'total': len(data['scores'])})

@app.route('/api/scores/history', methods=['GET'])
def score_history():
    """Return last 20 scores for a given username."""
    username = request.args.get('username', 'Anonymous')
    data     = load_json('scores.json')
    history  = [s for s in data['scores'] if s.get('username') == username]
    return jsonify({'history': history[-20:], 'username': username})

# ─── Dashboard API ─────────────────────────────────────────────────────────────
@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    """
    Returns aggregated stats for a given username.
    ?username=Alice
    """
    username = request.args.get('username', 'Anonymous')
    data     = load_json('scores.json')

    user_scores = [s for s in data['scores'] if s.get('username') == username]

    if not user_scores:
        return jsonify({
            'username':       username,
            'total_sessions': 0,
            'avg_accuracy':   0,
            'best_accuracy':  0,
            'avg_wpm':        0,
            'best_wpm':       0,
            'modules':        {},
            'recent':         [],
            'streak':         0,
            'rank':           None,
        })

    accuracies  = [s['accuracy'] for s in user_scores]
    wpms        = [s['wpm'] for s in user_scores if s.get('wpm', 0) > 0]

    # Module breakdown
    modules = {}
    for s in user_scores:
        m = s.get('module', 'unknown')
        if m not in modules:
            modules[m] = {'count': 0, 'avg_accuracy': 0, 'accuracies': []}
        modules[m]['count'] += 1
        modules[m]['accuracies'].append(s['accuracy'])
    for m in modules:
        acc_list = modules[m].pop('accuracies')
        modules[m]['avg_accuracy'] = round(statistics.mean(acc_list), 1)

    # Calculate streak (consecutive days with a score)
    dates  = sorted({s['timestamp'][:10] for s in user_scores}, reverse=True)
    streak = 0
    check  = datetime.date.today()
    for d in dates:
        if datetime.date.fromisoformat(d) == check:
            streak += 1
            check  -= datetime.timedelta(days=1)
        else:
            break

    # Global rank by accuracy
    all_sorted = sorted(data['scores'], key=lambda x: x.get('accuracy', 0), reverse=True)
    # Find best rank for this user
    user_ranks = [i+1 for i, s in enumerate(all_sorted) if s.get('username') == username]
    rank = min(user_ranks) if user_ranks else None

    # Speed feedback distribution
    feedback_counts = {'Optimal': 0, 'Too Slow': 0, 'Too Fast': 0}
    for s in user_scores:
        fb = s.get('speed_feedback', '')
        if fb in feedback_counts:
            feedback_counts[fb] += 1

    return jsonify({
        'username':        username,
        'total_sessions':  len(user_scores),
        'avg_accuracy':    round(statistics.mean(accuracies), 1),
        'best_accuracy':   round(max(accuracies), 1),
        'avg_wpm':         round(statistics.mean(wpms), 1) if wpms else 0,
        'best_wpm':        round(max(wpms), 1) if wpms else 0,
        'modules':         modules,
        'recent':          list(reversed(user_scores[-10:])),
        'streak':          streak,
        'rank':            rank,
        'feedback_dist':   feedback_counts,
        'total_users':     len({s.get('username') for s in data['scores']}),
    })

# ─── Audio API ─────────────────────────────────────────────────────────────────
@app.route('/api/audio', methods=['POST'])
def save_audio():
    if 'audio' not in request.files:
        return error('No audio field')
    audio_file = request.files['audio']
    filename   = f"rec_{uuid.uuid4()}.webm"
    filepath   = os.path.join(RECORDINGS_DIR, filename)
    audio_file.save(filepath)
    return jsonify({'success': True, 'filename': filename}), 201

@app.route('/api/recordings/<path:filename>')
def get_recording(filename):
    return send_from_directory(RECORDINGS_DIR, filename)

# ─── Health ────────────────────────────────────────────────────────────────────
@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.datetime.now().isoformat(),
                    'wpm_targets': WPM_TARGETS})

if __name__ == '__main__':
    print("🎤  Speech Fluency Trainer v2 — http://localhost:5000")
    app.run(debug=True, port=5000)
