export enum EEgripIndexPaths {
    ogrnip = "_attributes.ОГРН",
    inn = "_attributes.ИНН",

    firstName = "СвФЛ.ФИОРус._attributes.Имя",
    secondName = "СвФЛ.ФИОРус._attributes.Фамилия",
    patronymic = "СвФЛ.ФИОРус._attributes.Отчество",

    region = "СвАдрМЖ.АдресРФ.Регион._attributes.НаимРегион",
    district = "СвАдрМЖ.АдресРФ.Район._attributes.НаимРайон",
    city = "СвАдрМЖ.АдресРФ.Город._attributes.НаимГород",
    town = "СвАдрМЖ.АдресРФ.НаселПункт._attributes.НаимНаселПункт",
    street = "СвАдрМЖ.АдресРФ.Улица._attributes.НаимУлица",
}
