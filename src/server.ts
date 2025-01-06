import express from "express";
import { QueryResult } from "pg";
import { pool, connectToDb } from "./connection.js";
import inquirer from "inquirer";

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 1. View All Departments
async function viewDepartments() {
  const sql = "SELECT * FROM department";
  try {
    const result: QueryResult = await pool.query(sql);
    console.table(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
  }
}

// 2. View All Roles
async function viewRoles() {
  const sql = `
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id
  `;
  try {
    const result: QueryResult = await pool.query(sql);
    console.table(result.rows);
  } catch (err) {
    console.error('Error fetching roles:', err);
  }
}

// 3. View All Employees
async function viewEmployees() {
  const sql = `
    SELECT e.id, e.first_name, e.last_name, r.title AS job_title, d.name AS department, r.salary,
           m.first_name AS manager_first_name, m.last_name AS manager_last_name
    FROM employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON r.department_id = d.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `;
  try {
    const result: QueryResult = await pool.query(sql);
    console.table(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
}

// 4. Add a Department
async function addDepartment() {
  const { name } = await inquirer.prompt({
    type: 'input',
    name: 'name',
    message: 'Enter the department name:'
  });

  if (!name) {
    console.log('Department name is required.');
    return;
  }

  try {
    // Synchronize the sequence with the maximum department ID
    await pool.query(`
      SELECT setval('department_id_seq', (SELECT COALESCE(MAX(id), 1) FROM department), false);
    `);

    // Insert the new department
    const sql = "INSERT INTO department (name) VALUES ($1) RETURNING *";
    const result: QueryResult = await pool.query(sql, [name]);

    console.log(`Department added: ${result.rows[0].name}`);
  } catch (err) {
    console.error('Error adding department:', err);
  }
}

// 5. Add a Role
async function addRole() {
  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter the role title:' },
    { type: 'input', name: 'salary', message: 'Enter the salary for the role:' },
    { type: 'input', name: 'department_id', message: 'Enter the department ID for this role:' },
  ]);

  if (!title || !salary || !department_id) {
    console.log('All fields are required.');
    return;
  }

  const sql = "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *";
  try {
    const result: QueryResult = await pool.query(sql, [title, salary, department_id]);
    console.log(`Role added: ${result.rows[0].title}`);
  } catch (err) {
    console.error('Error adding role:', err);
  }
}

// 6. Add an Employee
async function addEmployee() {
  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: 'Enter the employee\'s first name:' },
    { type: 'input', name: 'last_name', message: 'Enter the employee\'s last name:' },
    { type: 'input', name: 'role_id', message: 'Enter the employee\'s role ID:' },
    { type: 'input', name: 'manager_id', message: 'Enter the employee\'s manager ID (optional):' },
  ]);

  if (!first_name || !last_name || !role_id) {
    console.log('First name, last name, and role ID are required.');
    return;
  }

  const sql = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4) RETURNING *";
  try {
    const result: QueryResult = await pool.query(sql, [first_name, last_name, role_id, manager_id || null]);
    console.log(`Employee added: ${result.rows[0].first_name} ${result.rows[0].last_name}`);
  } catch (err) {
    console.error('Error adding employee:', err);
  }
}

// 7. Update an Employee's Role
async function updateEmployeeRole() {
  console.log('Fetching list of employees...');

  try {
      const employeeResult = await pool.query('SELECT id, first_name, last_name FROM employee');
      
      if (employeeResult.rowCount === 0) {
          console.log('No employees found.');
          return;
      }

      // Create a list of employee names with their corresponding IDs
      const employees = employeeResult.rows.map(employee => ({
          name: `${employee.first_name} ${employee.last_name}`,
          value: employee.id
      }));

      // Prompt the user to select an employee
      const { employeeId } = await inquirer.prompt([
          {
              type: 'list',
              name: 'employeeId',
              message: 'Select the employee to update:',
              choices: employees
          }
      ]);

      // Prompt for the new role ID
      const { roleId } = await inquirer.prompt([
          { type: 'input', name: 'roleId', message: 'Enter the new role ID for the employee:' }
      ]);

      // Ensure roleId is numeric
      if (isNaN(roleId)) {
          console.log('Invalid input. Role ID must be numeric.');
          return;
      }

      // Check if the role exists in the database
      const roleResult = await pool.query('SELECT id FROM role WHERE id = $1', [roleId]);
      if (roleResult.rowCount === 0) {
          console.log('Role not found. Please enter a valid role ID.');
          return;
      }

      // Update the employee's role in the database
      const sqlUpdateEmployee = "UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *";
      const result = await pool.query(sqlUpdateEmployee, [roleId, employeeId]);

      if (result.rowCount === 0) {
          console.log('Employee not found.');
      } else {
          // Print the updated employee information
          const updatedEmployee = result.rows[0];
          console.log(`Employee role updated: ${updatedEmployee.first_name} ${updatedEmployee.last_name} now has the role with ID: ${updatedEmployee.role_id}`);
      }
  } catch (err) {
      console.error('Error updating employee role:', err);
  }
}


// Main menu
async function mainMenu() {
  try {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a Department',
        'Add a Role',
        'Add an Employee',
        'Update an Employees Role',
        'Exit'
      ]
    });

    switch (action) {
      case 'View All Departments':
        await viewDepartments();
        break;
      case 'View All Roles':
        await viewRoles();
        break;
      case 'View All Employees':
        await viewEmployees();
        break;
      case 'Add a Department':
        await addDepartment();
        break;
      case 'Add a Role':
        await addRole();
        break;
      case 'Add an Employee':
        await addEmployee();
        break;
      case 'Update an Employees Role':
        await updateEmployeeRole();
        break;
      case 'Exit':
        console.log('Goodbye!');
        process.exit(0);
        break;
    }

    // After the action is performed, call mainMenu again to repeat the prompt.
    await mainMenu();
  } catch (err) {
    console.error("Error in main menu: ", err);
  }
}

// Start the Inquirer prompts, and only after they finish, start the Express server
async function runApp() {
  await mainMenu();  // This starts the Inquirer prompt
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Run the app
runApp();

