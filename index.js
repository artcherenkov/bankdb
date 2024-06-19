const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const { faker } = require("@faker-js/faker");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "bank",
  port: 3306,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL server.");
});

function generateRandomIndividual() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    patronymic: `random patronymic ${faker.number.int({ min: 1, max: 99 })}`,
    passport: faker.number.int({ min: 1000000000, max: 9999999999 }).toString(),
    inn: faker.number.int({ min: 100000000000, max: 999999999999 }).toString(),
    snils: faker.number.int({ min: 10000000000, max: 99999999999 }).toString(),
    driverLicense: `${faker.string.alpha({ count: 1, casing: "upper" })}${faker.number.int(
      {
        min: 1000000,
        max: 9999999,
      },
    )}`,
    additionalDocs: "None",
    notes: `random notes ${faker.number.int({ min: 1, max: 99 })}`,
  };
}

function generateRandomBorrower() {
  return {
    inn: faker.number.int({ min: 100000000000, max: 999999999999 }).toString(),
    isIndividual: faker.datatype.boolean(),
    address: faker.location.streetAddress(),
    amount: (faker.number.int({ min: 1, max: 10 }) * 30000).toString(),
    conditions: `random conditions ${faker.number.int({ min: 1, max: 99 })}`,
    legalNotes: `random legalNotes ${faker.number.int({ min: 1, max: 99 })}`,
    contractList: `random contractList ${faker.number.int({ min: 1, max: 99 })}`,
  };
}

function generateRandomLoan(individualId, borrowerId) {
  return {
    individualId: individualId,
    amount: (faker.number.int({ min: 1, max: 10 }) * 30000).toString(),
    interestRate: faker.finance.amount({ min: 1, max: 10, dec: 2 }),
    term: faker.number.int({ min: 6, max: 60 }),
    conditions: `random conditions ${faker.number.int({ min: 1, max: 99 })}`,
    notes: `random notes ${faker.number.int({ min: 1, max: 99 })}`,
    borrowerId: borrowerId,
  };
}

function generateRandomOrganizationLoan(orgIndividualId) {
  return {
    organizationId: faker.number.int({ min: 1, max: 100 }),
    individualId: orgIndividualId,
    amount: (faker.number.int({ min: 1, max: 10 }) * 30000).toString(),
    term: faker.number.int({ min: 6, max: 60 }),
    interestRate: faker.finance.amount({ min: 1, max: 10, dec: 2 }),
    conditions: `random conditions ${faker.number.int({ min: 1, max: 99 })}`,
    notes: `random notes ${faker.number.int({ min: 1, max: 99 })}`,
  };
}

function executeQuery(query, values, res) {
  connection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Error executing query");
      return;
    }
    res.send("Record created successfully");
  });
}

function executeQueryAsync(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

function executeQueriesSequentially(queries, res, successMessage) {
  queries
    .reduce((promise, query) => {
      return promise.then(() => {
        return new Promise((resolve, reject) => {
          connection.query(query, (err, results) => {
            if (err) {
              console.error(`Error executing query: ${query}`, err);
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      });
    }, Promise.resolve())
    .then(() => res.send(successMessage))
    .catch((err) => res.status(500).send("Error executing queries"));
}

async function getRandomId(table) {
  return new Promise((resolve, reject) => {
    const query = `SELECT id FROM ${table} ORDER BY RAND() LIMIT 1`;
    connection.query(query, (err, results) => {
      if (err || results.length === 0) {
        reject("Error fetching random id");
      } else {
        resolve(results[0].id);
      }
    });
  });
}

app.get("/api/:table", (req, res) => {
  const table = req.params.table;
  const validTables = [
    "Individuals",
    "Borrowers",
    "Loans",
    "OrganizationLoans",
  ];

  if (!validTables.includes(table)) {
    return res.status(400).send("Invalid table name");
  }

  const query = `SELECT * FROM ${table}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error(`Error fetching ${table}:`, err);
      return res.status(500).send(`Error fetching ${table}`);
    }
    res.json(results);
  });
});

app.post("/api/:table/random", async (req, res) => {
  const table = req.params.table;
  const validTables = [
    "Individuals",
    "Borrowers",
    "Loans",
    "OrganizationLoans",
  ];

  if (!validTables.includes(table)) {
    return res.status(400).send("Invalid table name");
  }

  try {
    let query = "";
    let values = [];

    switch (table) {
      case "Individuals":
        const individual = generateRandomIndividual();
        query = `
          INSERT INTO Individuals (firstName, lastName, patronymic, passport, inn, snils, driverLicense, additionalDocs, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          individual.firstName,
          individual.lastName,
          individual.patronymic,
          individual.passport,
          individual.inn,
          individual.snils,
          individual.driverLicense,
          individual.additionalDocs,
          individual.notes,
        ];
        break;
      case "Borrowers":
        const borrower = generateRandomBorrower();
        query = `
          INSERT INTO Borrowers (inn, isIndividual, address, amount, conditions, legalNotes, contractList)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          borrower.inn,
          borrower.isIndividual,
          borrower.address,
          borrower.amount,
          borrower.conditions,
          borrower.legalNotes,
          borrower.contractList,
        ];
        break;
      case "Loans":
        const individualId = await getRandomId("Individuals");
        const borrowerId = await getRandomId("Borrowers");
        const loan = generateRandomLoan(individualId, borrowerId);
        query = `
          INSERT INTO Loans (individualId, amount, interestRate, term, conditions, notes, borrowerId)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          loan.individualId,
          loan.amount,
          loan.interestRate,
          loan.term,
          loan.conditions,
          loan.notes,
          loan.borrowerId,
        ];
        break;
      case "OrganizationLoans":
        const orgIndividualId = await getRandomId("Individuals");
        const organizationLoan =
          generateRandomOrganizationLoan(orgIndividualId);
        query = `
          INSERT INTO OrganizationLoans (organizationId, individualId, amount, term, interestRate, conditions, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        values = [
          organizationLoan.organizationId,
          organizationLoan.individualId,
          organizationLoan.amount,
          organizationLoan.term,
          organizationLoan.interestRate,
          organizationLoan.conditions,
          organizationLoan.notes,
        ];
        break;
      default:
        return res.status(400).send("Invalid table name");
    }

    executeQuery(query, values, res);
  } catch (error) {
    console.error("Error generating random data:", error);
    res.status(500).send("Error generating random data");
  }
});

app.delete("/api/clear", (req, res) => {
  const queries = [
    "DELETE FROM Loans",
    "DELETE FROM OrganizationLoans",
    "DELETE FROM Borrowers",
    "DELETE FROM Individuals",
  ];

  executeQueriesSequentially(queries, res, "All tables cleared successfully");
});

app.delete("/api/deleteExceptFirstThree", async (req, res) => {
  const tables = ["Loans", "OrganizationLoans", "Borrowers", "Individuals"];
  try {
    for (const table of tables) {
      const deleteQuery = `
        DELETE FROM ${table}
        WHERE id NOT IN (SELECT id FROM (SELECT id FROM ${table} ORDER BY id LIMIT 3) AS temp)
      `;
      await executeQueryAsync(deleteQuery);
    }
    res.send("All tables cleaned except first three records.");
  } catch (error) {
    console.error("Error cleaning tables:", error);
    res.status(500).send("Error cleaning tables");
  }
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
