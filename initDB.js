const mysql = require('mysql2');
const con = require('./connect.js');

const fs = require('fs');
const path = require('path');

const connection = con.connect(mysql);

connection.query("DROP DATABASE IF EXISTS kostka;");
connection.query("CREATE DATABASE kostka;");
connection.query("USE kostka;");

connection.query("DROP TABLE IF EXISTS Users;");
connection.query("DROP TABLE IF EXISTS Projects;");
connection.query("DROP TABLE IF EXISTS Events;");
connection.query("DROP TABLE IF EXISTS Cubes;");



connection.query("CREATE TABLE Users (UserID int NOT NULL AUTO_INCREMENT, GoogleID varchar(255), Email varchar(255), PRIMARY KEY (UserID), UNIQUE (GoogleID), UNIQUE (Email));");

connection.query("CREATE TABLE Cubes (CubeID int NOT NULL AUTO_INCREMENT, UserID int NOT NULL, Mac varchar(255), Cube_users_ID varchar(255), PRIMARY KEY (CubeID), UNIQUE (Mac), FOREIGN KEY (UserID) REFERENCES Users(UserID));");

connection.query("CREATE TABLE Projects (ProjectID int NOT NULL AUTO_INCREMENT, UserID int NOT NULL, CubeID int, Side int DEFAULT -1, Name varchar(255), Time int DEFAULT 0, PRIMARY KEY (ProjectID), FOREIGN KEY (UserID) REFERENCES Users(UserID));");

connection.query("CREATE TABLE Events (EventID int NOT NULL AUTO_INCREMENT, ProjectID int NOT NULL, Name varchar(255), Time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (EventID), FOREIGN KEY (ProjectID) REFERENCES Projects(ProjectID));");

connection.end();