const db = require('../config/database');

const User = {
// Menambah user baru saat register
create: (name, email, password, callback) => {

    const query =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')";

    db.query(
        query,
        [name, email, password],
        callback
    );

},

// Mencari user berdasarkan email saat login
findByEmail: (email, callback) => {

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        callback
    );

},

// Update user
updateUser: (
    id,
    name,
    email,
    role,
    callback
) => {

    const query = `
        UPDATE users
        SET
            name = ?,
            email = ?,
            role = ?
        WHERE id = ?
    `;

    db.query(
        query,
        [name, email, role, id],
        callback
    );

},

// Hapus user
deleteUser: (
    id,
    callback
) => {

    db.query(
        "DELETE FROM users WHERE id = ?",
        [id],
        callback
    );

},

saveResetToken: (
    email,
    token,
    expired,
    callback
) => {

    const query = `
        UPDATE users
        SET
            reset_token = ?,
            reset_token_expired = ?
        WHERE email = ?
    `;

    db.query(
        query,
        [token, expired, email],
        callback
    );

},

findByResetToken: (
    token,
    callback
) => {

    const query = `
        SELECT *
        FROM users
        WHERE
            reset_token = ?
        AND
            reset_token_expired > NOW()
    `;

    db.query(
        query,
        [token],
        callback
    );

},

updatePassword: (
    id,
    password,
    callback
) => {

    const query = `
        UPDATE users
        SET
            password = ?,
            reset_token = NULL,
            reset_token_expired = NULL
        WHERE id = ?
    `;

    db.query(
        query,
        [password, id],
        callback
    );

}
};
module.exports = User;
