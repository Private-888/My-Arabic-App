-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Words table (core vocabulary database)
CREATE TABLE words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    term TEXT NOT NULL,
    arabic TEXT NOT NULL,
    transliteration TEXT,
    meaning TEXT NOT NULL,
    notes TEXT,
    dialect TEXT DEFAULT 'Palestinian',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, term, arabic)
);

-- Reviews table (learning state for each word)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    state TEXT NOT NULL DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'known')),
    due_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    interval_days INTEGER NOT NULL DEFAULT 0,
    ease_factor DECIMAL(5,2) NOT NULL DEFAULT 2.5,
    repetition_count INTEGER NOT NULL DEFAULT 0,
    lapse_count INTEGER NOT NULL DEFAULT 0,
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- Daily stats table
CREATE TABLE daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reviews_completed INTEGER NOT NULL DEFAULT 0,
    new_words_learned INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    streak INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Profiles table
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    dialect TEXT NOT NULL DEFAULT 'Palestinian',
    daily_goal INTEGER NOT NULL DEFAULT 20,
    avatar_url TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    total_words_learned INTEGER NOT NULL DEFAULT 0,
    favorite_categories TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    tags TEXT[],
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lesson words junction table
CREATE TABLE lesson_words (
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, word_id)
);

-- Course progress table
CREATE TABLE course_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed_percent INTEGER NOT NULL DEFAULT 0 CHECK (completed_percent >= 0 AND completed_percent <= 100),
    last_lesson_id UUID REFERENCES lessons(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Scenarios table
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_ar TEXT,
    goal_en TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scenario tasks table
CREATE TABLE scenario_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('ask_question', 'introduce', 'respond', 'choose_phrase', 'speak')),
    prompt TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scenario task words junction table
CREATE TABLE scenario_task_words (
    task_id UUID NOT NULL REFERENCES scenario_tasks(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, word_id)
);

-- Bookmarks table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, word_id)
);

-- Create indexes for performance
CREATE INDEX idx_words_user_id ON words(user_id);
CREATE INDEX idx_words_category ON words(user_id, category);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_word_id ON reviews(word_id);
CREATE INDEX idx_reviews_due_date ON reviews(user_id, due_date) WHERE state != 'known';
CREATE INDEX idx_daily_stats_user_date ON daily_stats(user_id, date DESC);
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_course_progress_user_course ON course_progress(user_id, course_id);
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_scenario_tasks_scenario_id ON scenario_tasks(scenario_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_word_id ON bookmarks(word_id);

-- Create updated_at triggers
CREATE TRIGGER update_words_updated_at BEFORE UPDATE ON words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_progress_updated_at BEFORE UPDATE ON course_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenarios_updated_at BEFORE UPDATE ON scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenario_tasks_updated_at BEFORE UPDATE ON scenario_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_task_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Words policies
CREATE POLICY "Users can view their own words"
    ON words FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own words"
    ON words FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own words"
    ON words FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own words"
    ON words FOR DELETE
    USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Users can view their own reviews"
    ON reviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
    ON reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (auth.uid() = user_id);

-- Daily stats policies
CREATE POLICY "Users can view their own daily stats"
    ON daily_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
    ON daily_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
    ON daily_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Courses policies
CREATE POLICY "Users can view their own courses"
    ON courses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
    ON courses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
    ON courses FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
    ON courses FOR DELETE
    USING (auth.uid() = user_id);

-- Lessons policies (users can access lessons for their courses)
CREATE POLICY "Users can view lessons for their courses"
    ON lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = lessons.course_id
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert lessons for their courses"
    ON lessons FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = lessons.course_id
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update lessons for their courses"
    ON lessons FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = lessons.course_id
            AND courses.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete lessons for their courses"
    ON lessons FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM courses
            WHERE courses.id = lessons.course_id
            AND courses.user_id = auth.uid()
        )
    );

-- Lesson words policies
CREATE POLICY "Users can manage lesson words for their courses"
    ON lesson_words FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN courses ON courses.id = lessons.course_id
            WHERE lessons.id = lesson_words.lesson_id
            AND courses.user_id = auth.uid()
        )
    );

-- Course progress policies
CREATE POLICY "Users can view their own course progress"
    ON course_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own course progress"
    ON course_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own course progress"
    ON course_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- Scenarios policies
CREATE POLICY "Users can view their own scenarios"
    ON scenarios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenarios"
    ON scenarios FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenarios"
    ON scenarios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenarios"
    ON scenarios FOR DELETE
    USING (auth.uid() = user_id);

-- Scenario tasks policies
CREATE POLICY "Users can view tasks for their scenarios"
    ON scenario_tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scenarios
            WHERE scenarios.id = scenario_tasks.scenario_id
            AND scenarios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tasks for their scenarios"
    ON scenario_tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM scenarios
            WHERE scenarios.id = scenario_tasks.scenario_id
            AND scenarios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks for their scenarios"
    ON scenario_tasks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM scenarios
            WHERE scenarios.id = scenario_tasks.scenario_id
            AND scenarios.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks for their scenarios"
    ON scenario_tasks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM scenarios
            WHERE scenarios.id = scenario_tasks.scenario_id
            AND scenarios.user_id = auth.uid()
        )
    );

-- Scenario task words policies
CREATE POLICY "Users can manage task words for their scenarios"
    ON scenario_task_words FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM scenario_tasks
            JOIN scenarios ON scenarios.id = scenario_tasks.scenario_id
            WHERE scenario_tasks.id = scenario_task_words.task_id
            AND scenarios.user_id = auth.uid()
        )
    );

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
    ON bookmarks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
    ON bookmarks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
    ON bookmarks FOR DELETE
    USING (auth.uid() = user_id);

