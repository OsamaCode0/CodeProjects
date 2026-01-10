



interface CrewMember {
  name: string;
  id: number;
}

interface Pilot extends CrewMember {
  licenseNumber: string;
}

const pilot1: Pilot = {
  name: "Test",
  id: 2,
  licenseNumber: "test"
}