const original =  {
  name: "John Doe",
  age: 30,
  city: "New York",
  hobbies: [
    "reading",
    "cooking",
    "hiking",
  ],
  address: {
    street: "123 Main Street",
    zipCode: "10001",
  },
}

const shallowCopy = { ...original};

const deepCopy = JSON.parse(JSON.stringify(original));