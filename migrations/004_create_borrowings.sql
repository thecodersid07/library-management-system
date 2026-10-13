CREATE TABLE borrowings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    book_id INTEGER NOT NULL REFERENCES books(id),
    borrowed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_at TIMESTAMPTZ NOT NULL,
    returned_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX one_active_borrowing_per_book
ON borrowings (book_id)
WHERE returned_at IS NULL;