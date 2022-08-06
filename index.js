const contactsAPI = require("./db/contacts.js");
const { Command } = require("commander");
const program = new Command();
program
  .option("-a, --action <type>", "choose action")
  .option("-i, --id <type>", "user id")
  .option("-n, --name <type>", "user name")
  .option("-e, --email <type>", "user email")
  .option("-p, --phone <type>", "user phone");

program.parse(process.argv);

const argv = program.opts();

async function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      contactsAPI.listContacts();
      break;

    case "get":
      contactsAPI.getContactById(Number(id));
      break;

    case "add":
      await contactsAPI.addContact(name, email, phone);
      break;

    case "remove":
      await contactsAPI.removeContact(Number(id));
      break;

    default:
      console.warn(
        "\x1B[31m Our complaisant server doesn't know this command!"
      );
  }
}

function main() {
  invokeAction(argv).then(() => process.exit(0));
}

main();
