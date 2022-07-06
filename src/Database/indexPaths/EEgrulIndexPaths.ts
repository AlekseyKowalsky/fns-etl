export enum EEgrulIndexPaths {
    ogrn = "_attributes.ОГРН",
    inn = "_attributes.ИНН",

    shortName = "СвНаимЮЛ._attributes.НаимЮЛСокр",
    longName = "СвНаимЮЛ._attributes.НаимЮЛПолн",

    // workerFirstName = "СведДолжнФЛ.СвФЛ._attributes.Имя",
    workerSecondName = "СведДолжнФЛ.СвФЛ._attributes.Фамилия",
    // workerPatronymic = "СведДолжнФЛ.СвФЛ._attributes.Отчество",

    // creatorFLFirstName = "",
    creatorFLSecondName = "СвУчредит.УчрФЛ.СвФЛ._attributes.Фамилия",
    // creatorFLPatronymic = "",

    creatorULRos = "СвУчредит.УчрЮЛРос.НаимИННЮЛ._attributes.НаимЮЛПолн",
    creatorULin = "СвУчредит.УчрЮЛИн.НаимИННЮЛ._attributes.НаимЮЛПолн",
    creatorULRosMO = "СвУчредит.УчрРФСубМО.ВидНаимУчр._attributes.НаимМО",

    region = "СвАдресЮЛ.АдресРФ.Регион._attributes.НаимРегион",
    district = "СвАдресЮЛ.АдресРФ.Район._attributes.НаимРайон",
    city = "СвАдресЮЛ.АдресРФ.Город._attributes.НаимГород",
    town = "СвАдресЮЛ.АдресРФ.НаселПункт._attributes.НаимНаселПункт",
    street = "СвАдресЮЛ.АдресРФ.Улица._attributes.НаимУлица",
    house = "СвАдресЮЛ.АдресРФ._attributes.Дом",
}
