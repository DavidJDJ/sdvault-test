export enum FieldType {
    TextField = 1,
    DateField,
    BooleanField,
    NumberField,
    LookupField
}

export enum Operator {
    EqualTo = 1,
    GreaterThan,
    GreaterThanOrEqualTo,
    LessThan,
    LessThanOrEqualTo,
    Contains
  }
  
  export enum FiltroBuscadorGroup { 
    And = 1,
    Or
  }
    
  export class FiltroBuscador {
    public Field: string;
    public Value: any;
    public Type:FieldType;
    public Operator?: Operator;
    public Group?: FiltroBuscadorGroup;
  
    constructor() {
      this.Field = '';
      this.Value = '';
      this.Type = FieldType.TextField;
      this.Operator = Operator.EqualTo;
      this.Group = FiltroBuscadorGroup.And;
    }
  }