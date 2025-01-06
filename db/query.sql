-- View all departments
SELECT id, name 
FROM department;

-- View all roles
SELECT role.id, role.title, role.salary, department.name AS department
FROM role
JOIN department ON role.department_id = department.id;

-- View all employees
SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title, 
       department.name AS department, role.salary, 
       manager.first_name || ' ' || manager.last_name AS manager
FROM employee
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
LEFT JOIN employee manager ON employee.manager_id = manager.id;

-- Add a department
INSERT INTO department (name)
VALUES ('[Department Name]');

--Add a role 
INSERT INTO role (title, salary, department_id)
VALUES ('[Role Title]', [Salary], (SELECT id FROM department WHERE name = '[Department Name]'));

--Add an employee
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('[First Name]', '[Last Name]', 
        (SELECT id FROM role WHERE title = '[Role Title]'),
        (SELECT id FROM employee WHERE first_name || ' ' || last_name = '[Manager Name]'));

--Update an employee
UPDATE employee
SET role_id = (SELECT id FROM role WHERE title = '[New Role Title]')
WHERE id = (SELECT id FROM employee WHERE first_name || ' ' || last_name = '[Employee Name]');