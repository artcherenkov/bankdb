CREATE DATABASE IF NOT EXISTS bank;
USE bank;

-- Создание таблицы Individuals
CREATE TABLE IF NOT EXISTS Individuals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(50),
  lastName VARCHAR(50),
  patronymic VARCHAR(50),
  passport VARCHAR(20),
  inn VARCHAR(12),
  snils VARCHAR(11),
  driverLicense VARCHAR(20),
  additionalDocs TEXT,
  notes TEXT
);

-- Создание таблицы Borrowers
CREATE TABLE IF NOT EXISTS Borrowers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inn VARCHAR(12),
  isIndividual BOOLEAN,
  address TEXT,
  amount DECIMAL(10, 2),
  conditions TEXT,
  legalNotes TEXT,
  contractList TEXT
);

-- Создание таблицы Loans
CREATE TABLE IF NOT EXISTS Loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  individualId INT,
  amount DECIMAL(10, 2),
  interestRate DECIMAL(5, 2),
  term INT,
  conditions TEXT,
  notes TEXT,
  borrowerId INT,
  FOREIGN KEY (individualId) REFERENCES Individuals(id),
  FOREIGN KEY (borrowerId) REFERENCES Borrowers(id)
);

-- Создание таблицы OrganizationLoans
CREATE TABLE IF NOT EXISTS OrganizationLoans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizationId INT,
  individualId INT,
  amount DECIMAL(10, 2),
  term INT,
  interestRate DECIMAL(5, 2),
  conditions TEXT,
  notes TEXT,
  FOREIGN KEY (individualId) REFERENCES Individuals(id)
);

-- Вставка тестовых данных для таблицы Individuals
INSERT INTO Individuals (firstName, lastName, patronymic, passport, inn, snils, driverLicense, additionalDocs, notes) VALUES
('John', 'Doe', 'Middle', 'AB1234567', '123456789012', '12345678901', 'D1234567', 'None', 'Test note 1'),
('Jane', 'Smith', 'Middle', 'CD2345678', '234567890123', '23456789012', 'E2345678', 'None', 'Test note 2'),
('Alice', 'Johnson', 'Middle', 'EF3456789', '345678901234', '34567890123', 'F3456789', 'None', 'Test note 3');

-- Вставка тестовых данных для таблицы Borrowers
INSERT INTO Borrowers (inn, isIndividual, address, amount, conditions, legalNotes, contractList) VALUES
('123456789012', TRUE, '123 Main St', 1000.00, 'Test condition 1', 'Test legal note 1', 'Contract 1, Contract 2'),
('234567890123', FALSE, '456 Elm St', 2000.00, 'Test condition 2', 'Test legal note 2', 'Contract 3, Contract 4'),
('345678901234', TRUE, '789 Oak St', 3000.00, 'Test condition 3', 'Test legal note 3', 'Contract 5, Contract 6');

-- Вставка тестовых данных для таблицы Loans
INSERT INTO Loans (individualId, amount, interestRate, term, conditions, notes, borrowerId) VALUES
(1, 5000.00, 5.0, 12, 'Test condition 1', 'Test note 1', 1),
(2, 10000.00, 4.5, 24, 'Test condition 2', 'Test note 2', 2),
(3, 15000.00, 4.0, 36, 'Test condition 3', 'Test note 3', 3);

-- Вставка тестовых данных для таблицы OrganizationLoans
INSERT INTO OrganizationLoans (organizationId, individualId, amount, term, interestRate, conditions, notes) VALUES
(1, 1, 20000.00, 48, 3.5, 'Test condition 1', 'Test note 1'),
(2, 2, 30000.00, 60, 3.0, 'Test condition 2', 'Test note 2'),
(3, 3, 40000.00, 72, 2.5, 'Test condition 3', 'Test note 3');
