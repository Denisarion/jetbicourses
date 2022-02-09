/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblesson/Worklist/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblesson/Worklist/test/integration/pages/Worklist",
	"zjblesson/Worklist/test/integration/pages/Object",
	"zjblesson/Worklist/test/integration/pages/NotFound",
	"zjblesson/Worklist/test/integration/pages/Browser",
	"zjblesson/Worklist/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblesson.Worklist.view."
	});

	sap.ui.require([
		"zjblesson/Worklist/test/integration/WorklistJourney",
		"zjblesson/Worklist/test/integration/ObjectJourney",
		"zjblesson/Worklist/test/integration/NavigationJourney",
		"zjblesson/Worklist/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});