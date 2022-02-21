sap.ui.define([
"sap/ui/core/format/DateFormat"
	] , function (dateFormat) {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},
			Highlight : function(CreatedBy) {
				if(CreatedBy === "D1B1000034") {
					return "Success";
				}
			},
			formatModified: function(dDate, sFullName){
				var oDateFormat= dateFormat.getDateTimeInstance({
					pattern: "yyyy.MM.dd HH:mm"
				});
				var sDate = oDateFormat.format(dDate);
				return `${this.getModel("i18n").getResourceBundle().getText("textModifiedEdit")} ${sFullName} ${this.getModel("i18n").getResourceBundle().getText("textModifiedEditOn")} ${sDate}`
			}
		};

	}
);