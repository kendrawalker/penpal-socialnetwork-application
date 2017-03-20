
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS profile_pics;
DROP TABLE IF EXISTS user_bios;

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


CREATE TABLE user_bios (
    id SERIAL primary key,
    user_id INTEGER not null,
    bio TEXT,
    age INTEGER,
    gender VARCHAR(250),
    address_1 VARCHAR(250),
    address_2 VARCHAR(250),
    city VARCHAR(250),
    state VARCHAR(250),
    country VARCHAR(250),
    postal_code INTEGER
);
