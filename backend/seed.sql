-- USERS
-- Password is '123456' (placeholder)
INSERT INTO usuario (id, nombre, email, password) VALUES 
('u1000000-0000-0000-0000-000000000001', 'Admin User', 'admin@test.com', '123456'),
('u1000000-0000-0000-0000-000000000002', 'Dev Lead', 'lead@test.com', '123456'),
('u1000000-0000-0000-0000-000000000003', 'Frontend Dev', 'front@test.com', '123456'),
('u1000000-0000-0000-0000-000000000004', 'Backend Dev', 'back@test.com', '123456'),
('u1000000-0000-0000-0000-000000000005', 'Designer', 'design@test.com', '123456');

-- TEAMS
INSERT INTO equipo (id, nombre, "propietarioId") VALUES 
('e1000000-0000-0000-0000-000000000001', 'Engineering', 'u1000000-0000-0000-0000-000000000001'),
('e1000000-0000-0000-0000-000000000002', 'Product Design', 'u1000000-0000-0000-0000-000000000005'),
('e1000000-0000-0000-0000-000000000003', 'Marketing', 'u1000000-0000-0000-0000-000000000002');

-- TEAM MEMBERS (usuario_equipos_equipo)
-- Assuming TypeORM default naming: "usuario_equipos_equipo" ("usuarioId", "equipoId")
-- If table name differs, please adjust.
INSERT INTO usuario_equipos_equipo ("usuarioId", "equipoId") VALUES 
('u1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001'), -- Admin in Eng
('u1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001'), -- Lead in Eng
('u1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001'), -- Front in Eng
('u1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001'), -- Back in Eng
('u1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002'), -- Designer in Design
('u1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002'); -- Lead in Design

-- TASKS
INSERT INTO tarea (id, titulo, descripcion, estado, prioridad, "creadorId", "equipoId", "fechaCreacion", "fechaActualizacion") VALUES 
('t1000000-0000-0000-0000-000000000001', 'Implementar Auth', 'Configurar JWT y login', 'Terminada', 'Alta', 'u1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('t1000000-0000-0000-0000-000000000002', 'Diseñar Home Page', 'Crear mockups en Figma', 'Terminada', 'Media', 'u1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),
('t1000000-0000-0000-0000-000000000003', 'API de Tareas', 'CRUD de tareas en backend', 'En curso', 'Alta', 'u1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW()),
('t1000000-0000-0000-0000-000000000004', 'Componente Navbar', 'Responsive navbar con Tailwind', 'Pendiente', 'Baja', 'u1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days', NOW()),
('t1000000-0000-0000-0000-000000000005', 'Fix bug login', 'El token expira muy rápido', 'Pendiente', 'Alta', 'u1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 hour', NOW());

-- COMMENTS
INSERT INTO comentario (id, contenido, "autorId", "tareaId", fecha, "fechaActualizacion") VALUES 
('c1000000-0000-0000-0000-000000000001', 'Ya terminé la configuración base', 'u1000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('c1000000-0000-0000-0000-000000000002', 'Quedó muy bien!', 'u1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('c1000000-0000-0000-0000-000000000003', 'Estoy bloqueado con el ORM', 'u1000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- TASK WATCHERS
INSERT INTO task_watcher (id, "taskId", "userId", "createdAt", "updatedAt") VALUES 
('w1000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days', NOW()), -- Lead watching API task
('w1000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000003', 'u1000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days', NOW()), -- Front watching API task
('w1000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000001', 'u1000000-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days', NOW()); -- Lead watching Auth task

-- NOTIFICATIONS (For watchers)
INSERT INTO task_watcher_notification (id, "watcherId", "eventType", payload, "createdAt") VALUES 
-- Notification for Lead about comment on API Task
('n1000000-0000-0000-0000-000000000001', 'w1000000-0000-0000-0000-000000000001', 'createComment', '{"texto": "Estoy bloqueado con el ORM", "autor": "Backend Dev"}', NOW() - INTERVAL '1 day'),
-- Notification for Front about comment on API Task
('n1000000-0000-0000-0000-000000000002', 'w1000000-0000-0000-0000-000000000002', 'createComment', '{"texto": "Estoy bloqueado con el ORM", "autor": "Backend Dev"}', NOW() - INTERVAL '1 day'),
-- Notification for Lead about status change on API Task
('n1000000-0000-0000-0000-000000000003', 'w1000000-0000-0000-0000-000000000001', 'statusChange', '{"anterior": "Pendiente", "nuevo": "En curso"}', NOW() - INTERVAL '2 days');
