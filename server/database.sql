Drop TABLE IF EXISTS tablename;
-- first name and last name for now left here for future extension
-- should be Null then?
CREATE TABLE subscriber(
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(30) NOT NULL UNIQUE,  
    lastname VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO subscriber(firstname, lastname, email) values($1, $2, $3);