CREATE TABLE admin (
    name TEXT,
    collegeid INTEGER PRIMARY KEY NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE alumni (
    email TEXT PRIMARY KEY,
    name TEXT,
    password TEXT,
    profile_pic TEXT,
    passout TEXT,
    current_job TEXT,
    about TEXT,
    gender TEXT,
    status TEXT default 'Not evaluated',
    collegeid TEXT,
    value INT DEFAULT 1
);

CREATE TABLE event (
    id SERIAL PRIMARY KEY,
    event_pic TEXT,
    event_description TEXT,
    venue TEXT,
    event_date TEXT,
    event_time TEXT,
    host_name TEXT,
    title TEXT
);

CREATE TABLE job_applications (
    application_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    hostemail TEXT,
    linkedin_profile TEXT,
    github_profile TEXT,
    availability TEXT,
    resume TEXT,
    applicant_email TEXT,
    answer TEXT,
    status TEXT default 'Not evaluated',
    applicant_name text
);

CREATE TABLE job_post (
    id SERIAL PRIMARY KEY,
    title TEXT,
    company_name TEXT,
    location TEXT,
    vacancy INTEGER,
    description TEXT,
    job_type TEXT,
    email TEXT,
    current_status TEXT default 'Not evaluated by admin',
    posted_by TEXT
);

CREATE TABLE student (
    roll_no TEXT PRIMARY KEY,
    name TEXT,
    password TEXT,
    profile_pic TEXT,
    gender TEXT,
    batch TEXT,
    email TEXT,
    value INT DEFAULT 1
);

CREATE TABLE success_story (
    id SERIAL PRIMARY KEY,
    name TEXT,
    passout TEXT,
    story TEXT,
    success_story_image TEXT,
    email TEXT,
    title TEXT,
    profile_pic TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
