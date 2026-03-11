-- Tự động tạo database khi PostgreSQL container khởi động lần đầu
-- File này được PostgreSQL chạy tự động nếu mount vào /docker-entrypoint-initdb.d/

-- Tạo DB chính (thường POSTGRES_DB đã tạo sẵn, file này để chắc chắn)
SELECT 'CREATE DATABASE "sports-booking"'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'sports-booking'
)\gexec
