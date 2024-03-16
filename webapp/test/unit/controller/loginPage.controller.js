/*global QUnit*/

sap.ui.define([
	"compensar/citas.medicas/controller/loginPage.controller"
], function (Controller) {
	"use strict";

	QUnit.module("loginPage Controller");

	QUnit.test("I should test the loginPage controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
