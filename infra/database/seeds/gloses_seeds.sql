INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Architecture pattern, also called ports and adapters, that isolates the application core from the outside world (user interface, database, external services). The core talks to the outside only through ports, and adapters implement those ports for each technology, so the core can be tested and driven without them. Introduced by Alistair Cockburn in 2005.', 'Hexagonal architecture', 'Craft, Architecture', ARRAY['ARCHITECTURE', 'CRAFT'], NOW())
;

INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Software design approach that models the code on the business domain, built with domain experts through a shared ubiquitous language. Strategic design splits a large system into bounded contexts; tactical patterns include entities, value objects, aggregates, repositories and domain events. Introduced by Eric Evans in his 2003 book Domain-Driven Design: Tackling Complexity in the Heart of Software.', 'Domain-Driven Design (DDD)', 'DDD, Architecture, Design', ARRAY['DDD', 'ARCHITECTURE'], NOW())
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


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Object-oriented design principle: instead of asking an object for its data and deciding outside of it, tell the object what to do, so that behaviour stays with the data it uses. The phrase comes from Alec Sharp''s Smalltalk by Example (1997) and was popularised by Andy Hunt and Dave Thomas, the Pragmatic Programmers.', 'Tell, Don''t Ask', 'Design, OOP', ARRAY['DESIGN'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Communication protocol that gives a client and a server a persistent, full-duplex channel over a single TCP connection, so the server can push messages without being polled. The connection starts as an HTTP request upgraded through a handshake, then uses the ws:// or wss:// schemes. Standardised by the IETF as RFC 6455 in 2011.', 'WebSocket', 'Web, Network, Real-time', ARRAY['WEB'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('A distributed data store cannot guarantee Consistency (every read sees the latest write), Availability (every request gets a response) and Partition tolerance all at once: during a network partition it must give up either consistency or availability. Conjectured by Eric Brewer in 2000 and proven by Seth Gilbert and Nancy Lynch in 2002.', 'Théorème de CAP', 'Distributed systems, Database', ARRAY['DATABASE'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Distinction made by Fred Brooks in his 1986 essay No Silver Bullet: essential complexity is inherent to the problem the software must solve, while accidental complexity comes from the tools, languages and choices used to solve it. Only accidental complexity can be removed, so no single technique can bring an order-of-magnitude gain in productivity. Ben Moseley and Peter Marks revisited it in Out of the Tar Pit (2006).', 'Complexité accidentelle vs essentielle', 'Design, Complexity', ARRAY['DESIGN'], NOW())
;
