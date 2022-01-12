BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined, bio) values ( 'Jeysen', 'jeysen@gmail.com', 5, '2021-06-21', 'I am a cool guy');

INSERT into login (hash, email) values ('$2y$12$gecCdZ.AlQM/doo1zQw5V.BwhAhRT5xLwNq15v0xXC6NA42hF1XkS', 'jeysen@gmail.com');

COMMIT;