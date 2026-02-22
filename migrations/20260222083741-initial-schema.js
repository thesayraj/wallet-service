"use strict";

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE users (
        id BIGINT PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE wallets (
        id BIGINT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        asset_type ENUM('GOLD', 'DIAMOND', 'LOYALTY') NOT NULL,
        balance BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_asset (user_id, asset_type),
        CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE transactions (
        id BIGINT PRIMARY KEY,
        reference_id VARCHAR(64) NOT NULL UNIQUE,
        type ENUM('PURCHASE', 'BONUS', 'SPEND') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE transaction_entries (
        id BIGINT PRIMARY KEY,
        transaction_id BIGINT NOT NULL,
        wallet_id BIGINT NOT NULL,
        amount BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_entries_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id),
        INDEX idx_wallet_audit (wallet_id, created_at),
        INDEX idx_balance_calc (wallet_id, amount)
    );

    -- Create System Treasury account and wallets
    INSERT INTO users (id, username) VALUES (1, 'SYSTEM_TREASURY');
    INSERT INTO wallets (id, user_id, asset_type, balance) VALUES 
    (1, 1, 'GOLD', 0), (2, 1, 'DIAMOND', 0), (3, 1, 'LOYALTY', 0);
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE transaction_entries;
    DROP TABLE transactions;
    DROP TABLE wallets;
    DROP TABLE users;
  `);
};

exports._meta = {
  version: 1,
};
