INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Invented by Alistair Cockburn in 2005', 'Hexagonale architecture', 'Craft, Architecture', ARRAY['CRAFT'], NOW())
;

INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Invented by Eric Evans in 2003', 'DDD', 'Architecture', ARRAY['DDD'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Software engineer and instructor, Robert C. Martin, introduced the collection of principles in his 2000 paper Design Principles and Design Patterns about software rot. The SOLID acronym was coined around 2004 by Michael Feathers.', 'SOLID', 'Design, OOP', ARRAY['DESIGN'], NOW())
;

-- TODO Double emploi avec l'import via script js
INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Automated testing technique that feeds a program large amounts of random, malformed or unexpected inputs to find crashes, assertion failures and security vulnerabilities. Coined by Barton Miller at the University of Wisconsin in 1988, in a class project that sent random input to Unix utilities.', 'Fuzz testing', 'Testing, Security', ARRAY['TEST', 'CRAFT'], NOW())
;
