-- sql code


CREATE DATABASE IF NOT EXISTS financewebsite;
USE financewebsite;


CREATE TABLE IF NOT EXISTS users (
    user_id     INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT            NOT NULL,
    amount         DECIMAL(19, 2) NOT NULL,
    type           ENUM('income', 'expense') NOT NULL,
    category_id    INT            NOT NULL,
    description    VARCHAR(255),
    date           DATE           NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT
);


INSERT INTO categories (name) VALUES
    ('Food'),
    ('Rent'),
    ('Transport'),
    ('Healthcare'),
    ('Entertainment'),
    ('Salary'),
    ('Utilities'),
    ('Shopping'),
    ('Education'),
    ('Other');
-- seed users:
-- passwords are just Password_123! hashed with bycrypt

INSERT INTO users (username, email, password_hash) VALUES
    ('user1',  'user1@example.com',  '$2a$12$HihQw59rvNsFOSqAcYJJC.3Q6slBI6Uy.pD53c5Hes5Cr7XOMiuvy'),
    ('user2',    'user2@example.com',    '$2a$12$HihQw59rvNsFOSqAcYJJC.3Q6slBI6Uy.pD53c5Hes5Cr7XOMiuvy'),
    ('user3',  'user3@example.com',  '$2a$12$HihQw59rvNsFOSqAcYJJC.3Q6slBI6Uy.pD53c5Hes5Cr7XOMiuvy');


INSERT INTO transactions (user_id, amount, type, category_id, description, date) VALUES
    -- user1's transactions
    (1, 2500.00, 'income',  6, 'Monthly salary',         '2026-04-01'),
    (1,   45.00, 'expense', 1, 'Grocery shopping',       '2026-04-03'),
    (1,  750.00, 'expense', 2, 'Monthly rent',           '2026-04-05'),
    (1,   30.00, 'expense', 3, 'Bus pass',               '2026-04-06'),
    -- user2's transactions
    (2, 3200.00, 'income',  6, 'Freelance payment',      '2026-04-01'),
    (2,   65.00, 'expense', 1, 'Restaurant dinner',      '2026-04-04'),
    (2,  900.00, 'expense', 2, 'Apartment rent',         '2026-04-05'),
    -- user3's transactions
    (3, 1800.00, 'income',  6, 'Part-time job',          '2026-04-02'),
    (3,   25.00, 'expense', 5, 'Cinema tickets',         '2026-04-07'),
    (3,   80.00, 'expense', 4, 'Pharmacy',               '2026-04-08');


CREATE OR REPLACE VIEW user_spending_summary AS
SELECT
    u.user_id,
    u.username,
    SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN t.type = 'income'  THEN t.amount ELSE -t.amount END) AS balance
FROM users u
LEFT JOIN transactions t ON u.user_id = t.user_id
GROUP BY u.user_id, u.username;
