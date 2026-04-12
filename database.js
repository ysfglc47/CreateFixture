// database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('users.db');

// Tablo oluştur
export const createTable = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password TEXT NOT NULL
      );`
    );
  });
};

// Kullanıcı ekle
export const insertUser = (email, password, onSuccess, onError) => {
  db.transaction((tx) => {
    tx.executeSql(
      'INSERT INTO users (email, password) VALUES (?, ?);',
      [email, password],
      (_, result) => onSuccess(result),
      (_, error) => {
        onError(error);
        return false;
      }
    );
  });
};

// Kullanıcı sorgula (giriş için)
export const getUser = (email, password, callback) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM users WHERE email = ? AND password = ?;',
      [email, password],
      (_, { rows }) => callback(rows._array)
    );
  });
};

export default db;
