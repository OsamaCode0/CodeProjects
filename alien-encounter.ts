

type AlienContact = {
  name: string,
  greeting?: string
  weapon?: string
}

function handleEncounter (contact: AlienContact) {

  if ('greeting' in contact) {
    console.log(`${contact.name} says ${contact.greeting}`)
  }else {
    console.log(`Warning! hostile alien ${contact.name} detected, armed with ${contact.weapon}`)
  }
}