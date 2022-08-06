const fs = require("fs");
const asyncFs = require("fs").promises;
const path = require("path");

const contactsPath = path.resolve("./db/contacts.json");
const nextIdPath = path.resolve("./db/nextId.txt");
const ENCODING = "utf8";
const EXIT_CODES = {
  cannotReadFile: 1,
  cannotWriteToFile: 2,
  badInput: 10,
};

//Спочатку я думав зробити зчитування на промісах, щоб у кожна функція зчитувала файл
//Потім я побачив, що таким чином дублюється багато коду,
//А також з'ясував те, що програма виконує одну команду та завершується
//Тому можна на самому початку синхронно прочитати файл
try {
  global.contacts = JSON.parse(fs.readFileSync(contactsPath, ENCODING));
} catch (error) {
  readFileErrorHandler(error, contactsPath);
}

const { contacts } = global;

try {
  global.nextId = Number(JSON.parse(fs.readFileSync(nextIdPath, ENCODING)));
} catch (error) {
  readFileErrorHandler(error, nextIdPath);
}

let { nextId } = global;

//Returns all contacts from the DB
function listContacts() {
  console.log(
    contacts.length
      ? contacts
      : "Unfortunately, our great database does not contain any contacts yet"
  );
}

//Returns a contact with the specified contactId
function getContactById(contactId) {
  if (isNaN(contactId)) {
    console.error("This id is not a number");
    process.exit(EXIT_CODES.badInput);
  }
  console.log(
    contacts.find((contact) => Number(contact.id) === contactId) ??
      `Unfortunately, our great database does not contain a contact with id ${contactId}`
  );
}

//Deletes a contact with the specified contactId
async function removeContact(contactId) {
  if (isNaN(contactId)) {
    console.error("This id is not a number");
    process.exit(EXIT_CODES.badInput);
  }
  const newContactsToWrite = contacts.filter(
    (contact) => Number(contact.id) !== contactId
  );
  if (newContactsToWrite.length === contacts.length) {
    console.log(
      `Our great database couldn't delete the contact with id ${contactId} because it doesn't exist`
    );
    process.exit(0);
  }
  try {
    await asyncFs.writeFile(
      contactsPath,
      JSON.stringify(newContactsToWrite),
      ENCODING
    );

    console.log(
      `This filthy brat with id ${contactId} has been successfully removed from your contact list!\nGlory to the User!`
    );
  } catch (error) {
    writeFileErrorHandler(error, contactsPath);
  }
}

//Adds new contact to the DB
async function addContact(name, email, phone) {
  if (!name || !email || !phone) {
    console.log("Invalid data provided");
    process.exit(EXIT_CODES.badInput);
  }

  const newContactsToWrite = [
    ...contacts,
    { id: (nextId++).toString(), name, email, phone },
  ];

  try {
    await asyncFs.writeFile(
      contactsPath,
      JSON.stringify(newContactsToWrite),
      ENCODING
    );

    console.log(
      `Our great database has successfully added ${
        newContactsToWrite[newContactsToWrite.length - 1].name
      } contact!\nAssigned Id: ${
        newContactsToWrite[newContactsToWrite.length - 1].id
      }`
    );
    try {
      await asyncFs.writeFile(nextIdPath, nextId.toString(), ENCODING);
    } catch (error) {
      writeFileErrorHandler(error, nextIdPath);
    }
  } catch (error) {
    writeFileErrorHandler(error, contactsPath);
  }
}

function readFileErrorHandler(error, file) {
  console.error(`Our great database cannot read ${file}\nError: ${error}`);
  process.exit(EXIT_CODES.cannotReadFile);
}

function writeFileErrorHandler(error, file) {
  console.error(
    `Our great database has encountered an error while trying to rewrite ${file}.\nError: ${error}\nNo changes have been made`
  );
  process.exit(EXIT_CODES.cannotWriteToFile);
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
