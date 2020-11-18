DROP TABLE IF EXISTS books;

CREATE TABLE books (
	id SERIAL PRIMARY KEY,
	thumbnail VARCHAR (255),
	title VARCHAR (255),
	authors VARCHAR (255),
	description TEXT,
	identifier TEXT
	
);
