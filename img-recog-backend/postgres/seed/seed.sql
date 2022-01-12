BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined, bio) values ( 'Jeysen', 'jeysen@gmail.com', 5, '2021-06-21', 'I am the first user');

INSERT into login (hash, email) values ('$2a$12$GUY548kQ4d.ydBYjijYdUu0ek7lnqglIVmIaFWcKiOOMZQuCYiCl2', 'jeysen@gmail.com');

COMMIT;