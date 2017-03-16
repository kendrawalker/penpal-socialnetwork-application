
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profile_pics;

CREATE TABLE users (
    id SERIAL primary key,
    first_name VARCHAR(250) not null,
    last_name VARCHAR(250) not null,
    email_address VARCHAR(250) UNIQUE not null,
    password VARCHAR not null
);


CREATE TABLE profile_pics (
    id SERIAL primary key,
    user_id INTEGER not null,
    profile_pic TEXT not null
);
