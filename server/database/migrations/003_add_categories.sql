-- Add new product categories
INSERT INTO categories (name, description) VALUES
('Otomotif', 'Suku cadang, aksesoris, dan pelumas kendaraan'),
('Pertanian', 'Pupuk, pestisida, dan alat pertanian'),
('Peralatan Rumah', 'Peralatan dapur dan rumah tangga')
ON CONFLICT DO NOTHING;

-- Reset sequence
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
