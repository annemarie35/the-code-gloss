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


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Team sizing rule from Amazon: a team should be small enough to be fed by two pizzas. Fewer people means fewer communication paths, so the team can decide quickly and own its service end to end with little coordination overhead. The rule is attributed to Jeff Bezos in the early 2000s, when Amazon reorganised into small autonomous teams.', 'Two-pizza team', 'Team, Organisation', ARRAY['AGILE'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Organisations that design systems produce designs that copy their own communication structures: the boundaries between modules follow the boundaries between teams. Team organisation is therefore an architecture decision. Stated by Melvin Conway in his 1968 paper How Do Committees Invent? and named Conway''s law by Fred Brooks in The Mythical Man-Month (1975).', 'Conway''s law', 'Architecture, Organisation, Team', ARRAY['ARCHITECTURE'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Development practice where code is written in short cycles driven by tests: write a failing test (red), write the simplest code that makes it pass (green), then improve the design while keeping the tests green (refactor). Tests become a safety net and a guide for design. Kent Beck developed it as part of Extreme Programming and described it in Test-Driven Development: By Example (2002).', 'Test-Driven Development (TDD)', 'Testing, XP, Design', ARRAY['TEST', 'CRAFT'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Migration pattern that replaces a legacy system gradually instead of rewriting it in one go: a new system grows around the old one, features are moved over one at a time behind a routing layer, until the legacy system can be switched off. Each step delivers value and keeps the risk small. Named by Martin Fowler in 2004 after the strangler fig, a plant that grows around its host tree until it replaces it.', 'Strangler fig', 'Legacy, Migration, Architecture', ARRAY['ARCHITECTURE'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Technique that turns a feature on or off at runtime through configuration, without deploying new code. It separates deployment from release: unfinished code can be merged and shipped hidden, then rolled out progressively, tested on a subset of users or switched off in an incident. Each flag adds branching to the code, so it should be removed once no longer needed. Pete Hodgson classifies the kinds of flags in Feature Toggles (aka Feature Flags) (2017).', 'Feature flag', 'Deployment, Release, Continuous Delivery', ARRAY['OPS'], NOW())
;


INSERT INTO gloses
(description, title, tags, themes, created_at)
VALUES
    ('Persistence pattern that stores every change to the application state as an immutable event in an append-only log, instead of overwriting the current state. The current state is rebuilt by replaying the events, which gives a full audit trail and lets you reconstruct the state at any past moment. Described by Martin Fowler in his 2005 article Event Sourcing, and popularised by Greg Young together with CQRS.', 'Event sourcing', 'Architecture, Persistence, CQRS', ARRAY['ARCHITECTURE', 'DDD'], NOW())
;
