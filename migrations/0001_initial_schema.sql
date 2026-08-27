-- ==============================================================================
-- RTB Exam Preparation Platform — Complete Cloudflare D1 Relational Schema (51 Tables)
-- ==============================================================================

-- 1. TAXONOMY & CLASSIFICATION TABLES (1-6)
CREATE TABLE IF NOT EXISTS domains (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE ON UPDATE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(domain_id, code)
);

CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(category_id, code)
);

CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE ON UPDATE CASCADE,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    summary TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(domain_id, code)
);

CREATE TABLE IF NOT EXISTS difficulties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    weight REAL NOT NULL DEFAULT 1.0,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS question_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT
);

-- 2. QUESTION BANK CORE TABLES (7-10)
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    difficulty_id TEXT NOT NULL REFERENCES difficulties(id) ON DELETE RESTRICT,
    question_type_id TEXT NOT NULL DEFAULT 'single_choice' REFERENCES question_types(id) ON DELETE RESTRICT,
    scenario TEXT,
    content TEXT NOT NULL,
    answer_explanation TEXT NOT NULL,
    clinical_explanation TEXT,
    exam_tips TEXT,
    hint TEXT,
    certification TEXT NOT NULL DEFAULT 'RBT 2nd Edition',
    status TEXT NOT NULL DEFAULT 'published',
    version INTEGER NOT NULL DEFAULT 1,
    content_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS question_options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    option_key TEXT NOT NULL,
    content TEXT NOT NULL,
    is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
    order_index INTEGER NOT NULL DEFAULT 0,
    UNIQUE(question_id, option_key)
);

CREATE TABLE IF NOT EXISTS question_tags (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    UNIQUE(question_id, tag)
);

CREATE TABLE IF NOT EXISTS question_references (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    source_title TEXT NOT NULL,
    section_or_page TEXT,
    url TEXT
);

-- 3. PRACTICE & EXAM SESSION TABLES (11-17)
CREATE TABLE IF NOT EXISTS question_attempts (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT NOT NULL,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_key TEXT NOT NULL,
    is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    mode TEXT NOT NULL DEFAULT 'practice',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT NOT NULL,
    domain_id TEXT REFERENCES domains(id) ON DELETE SET NULL,
    topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    difficulty_id TEXT REFERENCES difficulties(id) ON DELETE SET NULL,
    total_questions INTEGER NOT NULL,
    completed_questions INTEGER NOT NULL DEFAULT 0,
    correct_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    started_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS practice_session_questions (
    id TEXT PRIMARY KEY,
    practice_session_id TEXT NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    selected_option_key TEXT,
    is_correct INTEGER CHECK (is_correct IN (0, 1)),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE(practice_session_id, question_id)
);

CREATE TABLE IF NOT EXISTS mock_exams (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    domain_scope TEXT NOT NULL DEFAULT 'All Domains',
    duration_minutes INTEGER NOT NULL DEFAULT 90,
    passing_score_percent INTEGER NOT NULL DEFAULT 80,
    total_questions INTEGER NOT NULL DEFAULT 85,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS mock_exam_questions (
    id TEXT PRIMARY KEY,
    mock_exam_id TEXT NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    UNIQUE(mock_exam_id, question_id)
);

CREATE TABLE IF NOT EXISTS exam_attempts (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT NOT NULL,
    mock_exam_id TEXT NOT NULL REFERENCES mock_exams(id) ON DELETE RESTRICT,
    started_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 85,
    score_percent REAL NOT NULL DEFAULT 0.0,
    passed INTEGER NOT NULL DEFAULT 0 CHECK (passed IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'in_progress'
);

CREATE TABLE IF NOT EXISTS exam_attempt_questions (
    id TEXT PRIMARY KEY,
    exam_attempt_id TEXT NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    selected_option_key TEXT,
    is_flagged INTEGER NOT NULL DEFAULT 0 CHECK (is_flagged IN (0, 1)),
    is_correct INTEGER CHECK (is_correct IN (0, 1)),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    UNIQUE(exam_attempt_id, question_id)
);

-- 4. FLASHCARD & SRS TABLES (18-22)
CREATE TABLE IF NOT EXISTS flashcard_decks (
    id TEXT PRIMARY KEY,
    domain_id TEXT REFERENCES domains(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    card_count INTEGER NOT NULL DEFAULT 0,
    is_public INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS flashcards (
    id TEXT PRIMARY KEY,
    deck_id TEXT REFERENCES flashcard_decks(id) ON DELETE SET NULL,
    source_question_id TEXT REFERENCES questions(id) ON DELETE SET NULL,
    domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    explanation TEXT,
    conversion_method TEXT NOT NULL DEFAULT 'manual',
    status TEXT NOT NULL DEFAULT 'published',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS flashcard_progress (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT NOT NULL,
    flashcard_id TEXT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    interval_days INTEGER NOT NULL DEFAULT 0,
    repetition_count INTEGER NOT NULL DEFAULT 0,
    ease_factor REAL NOT NULL DEFAULT 2.5,
    due_date_timestamp INTEGER NOT NULL,
    last_reviewed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    status TEXT NOT NULL DEFAULT 'new',
    UNIQUE(anonymous_session_id, flashcard_id)
);

CREATE TABLE IF NOT EXISTS srs_settings (
    id TEXT PRIMARY KEY,
    initial_interval_days INTEGER NOT NULL DEFAULT 1,
    second_interval_days INTEGER NOT NULL DEFAULT 6,
    initial_ease_factor REAL NOT NULL DEFAULT 2.5,
    min_ease_factor REAL NOT NULL DEFAULT 1.3,
    mastery_threshold_days INTEGER NOT NULL DEFAULT 21,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    anonymous_session_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(anonymous_session_id, entity_type, entity_id)
);

-- 5. CONTENT / CMS TABLES (23-31)
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Exam Tips',
    author_name TEXT NOT NULL DEFAULT 'RTB Prep Editorial Team',
    is_published INTEGER NOT NULL DEFAULT 1,
    published_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS study_guides (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    read_time_minutes INTEGER NOT NULL DEFAULT 5,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer_markdown TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS seo_settings (
    route_pattern TEXT PRIMARY KEY,
    title_template TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    canonical_override TEXT,
    og_image_url TEXT,
    json_ld_schema TEXT,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS navigation_items (
    id TEXT PRIMARY KEY,
    location TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_name TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS landing_page_sections (
    id TEXT PRIMARY KEY,
    headline TEXT NOT NULL,
    subheadline TEXT,
    content_json TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY,
    r2_key TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    alt_text TEXT,
    uploaded_by_admin_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_dismissible INTEGER NOT NULL DEFAULT 1,
    start_timestamp INTEGER NOT NULL,
    end_timestamp INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
);

-- 6. AI ORCHESTRATION & LOG TABLES (32-38)
CREATE TABLE IF NOT EXISTS ai_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    base_url TEXT NOT NULL,
    secret_env_key_name TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_models (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
    model_identifier TEXT NOT NULL,
    display_name TEXT NOT NULL,
    cost_per_million_input_tokens_usd REAL NOT NULL DEFAULT 0.0,
    cost_per_million_output_tokens_usd REAL NOT NULL DEFAULT 0.0,
    max_tokens INTEGER NOT NULL DEFAULT 4096,
    is_tutor_default INTEGER NOT NULL DEFAULT 0,
    is_generation_default INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(provider_id, model_identifier)
);

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    temperature REAL NOT NULL DEFAULT 0.7,
    json_schema_definition TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_generation_jobs (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL REFERENCES ai_models(id) ON DELETE RESTRICT,
    template_id TEXT NOT NULL REFERENCES ai_prompt_templates(id) ON DELETE RESTRICT,
    domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE RESTRICT,
    topic_id TEXT REFERENCES topics(id) ON DELETE SET NULL,
    difficulty_id TEXT NOT NULL REFERENCES difficulties(id) ON DELETE RESTRICT,
    requested_count INTEGER NOT NULL DEFAULT 5,
    generated_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    error_summary TEXT,
    created_by_admin_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS ai_generation_items (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL REFERENCES ai_generation_jobs(id) ON DELETE CASCADE,
    generated_question_id TEXT REFERENCES questions(id) ON DELETE SET NULL,
    raw_json_response TEXT NOT NULL,
    validation_status TEXT NOT NULL DEFAULT 'valid',
    error_message TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
    id TEXT PRIMARY KEY,
    model_id TEXT NOT NULL REFERENCES ai_models(id) ON DELETE RESTRICT,
    feature TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost_usd REAL NOT NULL DEFAULT 0.0,
    ip_hash TEXT NOT NULL,
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS ai_errors (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    model_identifier TEXT NOT NULL,
    feature TEXT NOT NULL,
    http_status INTEGER,
    error_code TEXT NOT NULL,
    error_details TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 7. ADMIN SECURITY & RBAC TABLES (39-45)
CREATE TABLE IF NOT EXISTS admin_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS admin_permissions (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
    role_id TEXT NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id TEXT NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id TEXT NOT NULL REFERENCES admin_roles(id) ON DELETE RESTRICT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    last_login_at INTEGER
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_user_id TEXT REFERENCES admin_users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    diff_json TEXT,
    ip_address TEXT,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS feature_flags (
    key TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0, 1)),
    description TEXT,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS admin_settings (
    admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    PRIMARY KEY(admin_id, setting_key)
);

-- 8. FUTURE MONETIZATION & ENTITLEMENTS (46-51, Inactive in Phase 1)
CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 0,
    billing_interval TEXT NOT NULL DEFAULT 'lifetime',
    is_active INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS plan_features (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    limit_value INTEGER NOT NULL DEFAULT -1
);

CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL,
    max_redemptions INTEGER,
    times_redeemed INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER,
    is_active INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id TEXT PRIMARY KEY,
    coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    anonymous_session_id TEXT NOT NULL,
    redeemed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    external_customer_id TEXT NOT NULL,
    external_subscription_id TEXT NOT NULL UNIQUE,
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status TEXT NOT NULL,
    current_period_end INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE IF NOT EXISTS entitlements (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    entitlement_key TEXT NOT NULL,
    expires_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- 9. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_questions_domain_topic ON questions(domain_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_status_diff ON questions(status, difficulty_id);
CREATE INDEX IF NOT EXISTS idx_questions_content_hash ON questions(content_hash);
CREATE INDEX IF NOT EXISTS idx_questions_code ON questions(code);
CREATE INDEX IF NOT EXISTS idx_question_options_qid ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags(tag);
CREATE INDEX IF NOT EXISTS idx_question_attempts_qid ON question_attempts(question_id, is_correct);
CREATE INDEX IF NOT EXISTS idx_question_attempts_session ON question_attempts(anonymous_session_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_domain_topic ON flashcards(domain_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_source_q ON flashcards(source_question_id);
CREATE INDEX IF NOT EXISTS idx_fc_progress_due ON flashcard_progress(anonymous_session_id, due_date_timestamp, status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_generation_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action, created_at);
CREATE INDEX IF NOT EXISTS idx_study_guides_domain ON study_guides(domain_id, is_published);
CREATE INDEX IF NOT EXISTS idx_entitlements_lookup ON entitlements(identifier, entitlement_key);
