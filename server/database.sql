Drop TABLE IF EXISTS tablename;

SELECT * FROM subscriber;

-- first name and last name for now left here for future extension
-- should be Null then?


CREATE TABLE IF NOT EXISTS subscriber(
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(30),  
    lastname VARCHAR(30),
    email VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO subscriber(firstname, lastname, email) values($1, $2, $3);

-- Does it Need to have subscribed column? I don't really think so