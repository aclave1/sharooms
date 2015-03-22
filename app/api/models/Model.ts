export class SailsModel {
  attributes:Object;
  constructor(attributes:Object){
    this.attributes = attributes;
  }
  migrate:MigrationSetting;
  identity:string;
  connection:string;
  globalId:string;
  autoPK:boolean;
  autoCreatedAt:boolean;
  autoUpdatedAt:boolean;
  tableName:string;
}

export class Attribute{
  type:DataType;
  defaultsTo:any;
  autoIncrement:boolean;
  unique:boolean;
  required:boolean;
  primaryKey:boolean;
  enum:Array<any>;
  size:number;
  columnName:string;
}

export class DataType{
  static string = "string";
  static text = "text";
  static integer = "integer";
  static float = "float";
  static date = "date";
  static datetime = "datetime";
  static boolean = "boolean";
  static binary = "binary";
  static array = "array";
  static json = "json";
  static email = "email";
}

export class MigrationSetting{
  static safe = "safe";
  static drop = "drop";
  static alter = "alter";
}
