CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) > 0),
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','pelapor','approver')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL CHECK (char_length(nama) > 0),
  deskripsi TEXT NOT NULL CHECK (char_length(deskripsi) > 0),
  status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS decided_by INT REFERENCES users(id);
ALTER TABLE reports ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS permissions (
  role TEXT NOT NULL CHECK (role IN ('admin','pelapor','approver')),
  feature TEXT NOT NULL,
  allowed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (role, feature)
);

INSERT INTO users (username, password_hash, role) VALUES
('admin', '$2b$10$0WIdN3FpzxfaPa7yLcQtT.ScUa9yH.kQhufASNYn6VpuKBFOg4U2u', 'admin'),
('budi', '$2b$10$fgDQr9uX1443h4.1IlsiMeeqfnuXIEQqtPUbx0wuOi3xgeMFL/WR6', 'pelapor'),
('siti', '$2b$10$4h/0dJwl6Tx3mcdr77HPC.5vVl8YwP1cNJYrxCv0sBP0crWbYyYWC', 'approver')
ON CONFLICT (username) DO NOTHING;

INSERT INTO reports (nama, deskripsi, status, user_id) SELECT 'Survei Lahan Blok A - Bandung Selatan','Koordinat -6.95, 107.59, luas 1200m2, kontur miring 5 derajat','pending', id FROM users WHERE username='budi' UNION ALL SELECT 'Validasi POI Retail - Ciganitri','Koordinat -6.94, 107.60, foto storefront, titik POI geser 20m','pending', id FROM users WHERE username='budi' UNION ALL SELECT 'Inspeksi Utilitas - Tiang Mekar Raya','Koordinat -6.93, 107.58, tiang miring 15 derajat, risiko roboh, foto geotag','approved', id FROM users WHERE username='budi' UNION ALL SELECT 'Survei Drainase - Dayeuhkolot','Koordinat -6.96, 107.62, tinggi air 40cm, 10 rumah terdampak','rejected', id FROM users WHERE username='budi';

INSERT INTO permissions (role, feature, allowed) VALUES
('admin','reports.view', true), ('admin','reports.create', true), ('admin','reports.edit', true), ('admin','reports.approve', true), ('admin','users.manage', true), ('admin','rights.manage', true), ('admin','history.view', true),
('pelapor','reports.view', true), ('pelapor','reports.create', true), ('pelapor','reports.edit', true), ('pelapor','reports.approve', false), ('pelapor','users.manage', false), ('pelapor','rights.manage', false), ('pelapor','history.view', true),
('approver','reports.view', true), ('approver','reports.create', false), ('approver','reports.edit', false), ('approver','reports.approve', true), ('approver','users.manage', false), ('approver','rights.manage', false), ('approver','history.view', true)
ON CONFLICT (role, feature) DO NOTHING;

CREATE TABLE IF NOT EXISTS report_history (
  id SERIAL PRIMARY KEY,
  report_id INT NOT NULL REFERENCES reports(id),
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL CHECK (new_status IN ('approved','rejected')),
  decided_by INT NOT NULL REFERENCES users(id),
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
