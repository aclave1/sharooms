var SailsModel = (function () {
    function SailsModel(attributes) {
        this.attributes = attributes;
    }
    return SailsModel;
})();
exports.SailsModel = SailsModel;
var Attribute = (function () {
    function Attribute() {
    }
    return Attribute;
})();
exports.Attribute = Attribute;
var DataType = (function () {
    function DataType() {
    }
    DataType.string = "string";
    DataType.text = "text";
    DataType.integer = "integer";
    DataType.float = "float";
    DataType.date = "date";
    DataType.datetime = "datetime";
    DataType.boolean = "boolean";
    DataType.binary = "binary";
    DataType.array = "array";
    DataType.json = "json";
    DataType.email = "email";
    return DataType;
})();
exports.DataType = DataType;
var MigrationSetting = (function () {
    function MigrationSetting() {
    }
    MigrationSetting.safe = "safe";
    MigrationSetting.drop = "drop";
    MigrationSetting.alter = "alter";
    return MigrationSetting;
})();
exports.MigrationSetting = MigrationSetting;
