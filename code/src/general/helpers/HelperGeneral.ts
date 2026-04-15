import * as CamlBuilder from "camljs";
import {
  FiltroBuscador,
  FieldType,
  Operator,
  FiltroBuscadorGroup,
} from "../data/entities";

export const CamlQueryGenerator = (
  ViewColumns: string[],
  Filtros: FiltroBuscador[]
): any => {
  Filtros.sort((a, b) => b.Group - a.Group);
  let CamlQuery: any;
  const primerFiltro = Filtros.shift();
  switch (primerFiltro.Type) {
    case FieldType.TextField: {
      CamlQuery = new CamlBuilder()
        .View(ViewColumns)
        .RowLimit(3000)
        .Query()
        .Where()
        .TextField(primerFiltro.Field)
        .EqualTo(primerFiltro.Value)
        .ToString();
      break;
    }
    case FieldType.NumberField: {
      CamlQuery = new CamlBuilder()
        .View(ViewColumns)
        .RowLimit(3000)
        .Query()
        .Where()
        .NumberField(primerFiltro.Field)
        .EqualTo(Number(primerFiltro.Value))
        .ToString();
      break;
    }
    case FieldType.DateField: {
      if (primerFiltro.Operator === Operator.GreaterThanOrEqualTo) {
        CamlQuery = new CamlBuilder()
          .View(ViewColumns)
          .RowLimit(3000)
          .Query()
          .Where()
          .DateField(primerFiltro.Field)
          .GreaterThanOrEqualTo(primerFiltro.Value)
          .ToString();
      } else {
        CamlQuery = new CamlBuilder()
          .View(ViewColumns)
          .RowLimit(3000)
          .Query()
          .Where()
          .DateField(primerFiltro.Field)
          .EqualTo(primerFiltro.Value)
          .ToString();
      }
      break;
    }
    case FieldType.BooleanField: {
      CamlQuery = new CamlBuilder()
        .View(ViewColumns)
        .RowLimit(3000)
        .Query()
        .Where()
        .BooleanField(primerFiltro.Field)
        .EqualTo(Boolean(primerFiltro.Value))
        .ToString();
      break;
    }
    case FieldType.LookupField: {
      CamlQuery = new CamlBuilder()
        .View(ViewColumns)
        .RowLimit(3000)
        .Query()
        .Where()
        .LookupField(primerFiltro.Field)
        .ValueAsText()
        .EqualTo(primerFiltro.Value)
        .ToString();
      break;
    }
  }
  //Vamos modificando el query y agregando los siguientes filtros
  Filtros.forEach((filtro, index) => {
    switch (filtro.Type) {
      case FieldType.TextField: {
        if (filtro.Group === FiltroBuscadorGroup.And)
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendAnd()
            .TextField(filtro.Field)
            .EqualTo(filtro.Value)
            .ToString();
        else
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendOr()
            .TextField(filtro.Field)
            .EqualTo(filtro.Value)
            .ToString();
        break;
      }
      case FieldType.NumberField: {
        if (filtro.Group === FiltroBuscadorGroup.And)
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendAnd()
            .NumberField(filtro.Field)
            .EqualTo(Number(filtro.Value))
            .ToString();
        else
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendOr()
            .NumberField(filtro.Field)
            .EqualTo(Number(filtro.Value))
            .ToString();
        break;
      }
      case FieldType.DateField: {
        if (filtro.Group === FiltroBuscadorGroup.And) {
          if (filtro.Operator === Operator.GreaterThanOrEqualTo) {
            CamlQuery = CamlBuilder.FromXml(CamlQuery)
              .ModifyWhere()
              .AppendAnd()
              .DateField(filtro.Field)
              .GreaterThanOrEqualTo(filtro.Value)
              .ToString();
          } else {
            CamlQuery = CamlBuilder.FromXml(CamlQuery)
              .ModifyWhere()
              .AppendAnd()
              .DateField(filtro.Field)
              .EqualTo(filtro.Value)
              .ToString();
          }
        } else {
          if (filtro.Operator === Operator.GreaterThanOrEqualTo) {
            CamlQuery = CamlBuilder.FromXml(CamlQuery)
              .ModifyWhere()
              .AppendOr()
              .DateField(filtro.Field)
              .GreaterThanOrEqualTo(filtro.Value)
              .ToString();
          } else {
            CamlQuery = CamlBuilder.FromXml(CamlQuery)
              .ModifyWhere()
              .AppendOr()
              .DateField(filtro.Field)
              .EqualTo(filtro.Value)
              .ToString();
          }
        }
        break;
      }
      case FieldType.BooleanField: {
        if (filtro.Group === FiltroBuscadorGroup.And)
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendAnd()
            .BooleanField(filtro.Field)
            .EqualTo(Boolean(filtro.Value))
            .ToString();
        else
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendOr()
            .BooleanField(filtro.Field)
            .EqualTo(Boolean(filtro.Value))
            .ToString();
        break;
      }
      case FieldType.LookupField: {
        if (filtro.Group === FiltroBuscadorGroup.And)
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendAnd()
            .LookupField(filtro.Field)
            .ValueAsText()
            .EqualTo(filtro.Value)
            .ToString();
        else
          CamlQuery = CamlBuilder.FromXml(CamlQuery)
            .ModifyWhere()
            .AppendOr()
            .LookupField(filtro.Field)
            .ValueAsText()
            .EqualTo(filtro.Value)
            .ToString();
        break;
      }
    }
  });
  return CamlQuery;
};

export const onFormatDate = (date?: Date): string => {
  return !date
    ? ""
    : date.getDate() +
    "/" +
    (date.getMonth() + 1) +
    "/" +
    (date.getFullYear() % 100);
};

export const addDays = (numOfDays: number, date = new Date()): Date => {
  date.setDate(date.getDate() + numOfDays);
  return date;
};

export const mapListToDropDownItems = (
  elements: any[],
  concatenarDescripcion?: boolean
): any => {
  return elements.map((data) => ({
    key: data.Id,
    text: concatenarDescripcion
      ? `${data.Consecutivo} - ${data.Title}`
      : data.Title,
  }));
};

export const addZeroRight = (num: any, places: any): string => {
  const zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
};

/* Regresa true si la fecha es de lunes a viernes y se encuenta en el rango*/
/*d1,d2 Range, d3 date to validate */
export const weekDateIsBetweenRange = (d1: Date, d2: Date, d3: Date):boolean => {
  const date1 = d1.getTime();
  const date2 = d2.getTime();
  const date3 = d3.getTime();
  if (d3.getDay() !== 0 && d3.getDay() !== 6) {
    if (date3 >= date1)
      if (date3 <= date2)
        return true;
      else
        return false;
    else
      return false;
  }
  else return false;
}

/*Agrega dias a fecha sin contar sabado, domingo y asuetos*/
export const addDaysWithoutWeekendsAndHolidays = (Holidays: Date[], daysToAdd: number): Date => {
  let today = new Date();
  today = new Date(today.toDateString());
  let startDate = new Date();
  startDate = new Date(startDate.toDateString());
  let endDate: Date, count = 0;
  while (count < daysToAdd) {
    endDate = new Date(startDate.setDate(startDate.getDate() + 1));
    if (endDate.getDay() !== 0 && endDate.getDay() !== 6) {
      count++;
    }
  }

  Holidays.forEach(holiday => {
    const existeAsueto = weekDateIsBetweenRange(today, endDate, holiday);
    if (existeAsueto)
      endDate = new Date(startDate.setDate(startDate.getDate() + 1));
  });

  return endDate;
}