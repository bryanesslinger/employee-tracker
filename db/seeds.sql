INSERT INTO department (name)
VALUES ('Sales'),
       ('Marketing'),
       ('Product'),
       ('Engineering'),
       ('Customer Success');
    
INSERT INTO role (title, salary, department_id)
VALUES ('Sales Development Rep', 50000, 1),
       ('Sales Consultant', 75000, 1),
       ('Customer Marketing', 50000, 2),
       ('Product Marketing', 100000, 2),
       ('Product Manager', 100000, 3),
       ('Product Director', 150000, 3),
       ('Staff Engineer', 200000, 4),
       ('Engineering Manager', 200000, 4),
       ('Customer Success Manager', 100000, 5),
       ('VP Customer Success', 200000, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Clark', 'Kent', 1, 2),
       ('Bruce', 'Wayne', 2, NULL),
       ('Michael', 'Scott', 3, 4),
       ('David', 'Wallace', 4, NULL),
       ('Andy', 'Dwyer', 5, 6),
       ('Ron', 'Swanson', 6, NULL),
       ('Ben', 'Wyatt', 7, 8),
       ('Leslie', 'Knope', 8, NULL),
       ('April', 'Ludgate', 9, 10),
       ('Ann', 'Perkins', 10, NULL);
       
    
