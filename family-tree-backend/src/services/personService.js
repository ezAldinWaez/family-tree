class PersonService {
  static getBasicInfo(person) {
    if (!person) return null;
    return {
      id: person._id,
      fullName: person.fullName,
      sex: person.sex,
      birthYear: person.birth?.date
        ? new Date(person.birth.date).getFullYear()
        : null,
      isDead: person.isDead,
      deathYear: person.death?.date
        ? new Date(person.death.date).getFullYear()
        : null,
    };
  }

  static getFullInfo(person) {
    if (!person) return null;
    return {
      id: person._id,
      fullName: person.fullName,
      sex: person.sex,
      birth: person.birth,
      isDead: person.isDead,
      death: person.death,
      contact: person.contact,
    };
  }

  static makeFullInfo(data) {
    return {
      fullName: data.fullName,
      sex: data.sex,
      birth: {
        date: data.birth?.date,
        place: data.birth?.place,
      },
      isDead: data.isDead || false,
      death: data.isDead
        ? {
            date: data.death?.date,
            place: data.death?.place,
          }
        : undefined,
      contact: {
        address: data.contact?.address,
        email: data.contact?.email,
        phone: data.contact?.phone,
      },
    };
  }
}

module.exports = PersonService;
