sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";
	var modelGeneral;
	return BaseController.extend("compensar.citas.medicas.controller.Token", {
		onSendToken: function(){
			var oToken = this.getView().byId("hl-token").getContent();
			oToken.forEach(function(oItem){
				oItem.setValue("");
			});
			modelGeneral.setProperty("/reenviaToken",true);
			var username = modelGeneral.getProperty("/username");
			this.generaToken({
				"username": username
			});
		},
		onValidaToken: function(){
			modelGeneral.setProperty("/reenviaToken",false)
			var oToken = this.getView().byId("hl-token").getContent();
			var sToken = ""
			oToken.forEach(function(oItem){
				sToken = sToken + oItem.getValue();
			})
			this.validacionToken({
				"token": sToken,
  				"username": modelGeneral.getProperty("/username")
			})
		},
		onNaveCreatePassword: function(){
			this.getRouter().navTo("CreatePassword");
		},
		handleRouteMatched: function(oEvent) {
			//this.getView().byId("mi-token").setValue("");
			var oToken = this.getView().byId("hl-token").getContent();
			oToken.forEach(function(oItem){
				oItem.setValue("");
			})
			this.onGetModel();
			modelGeneral = this.getView().getModel("modelGeneral");
			
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PageToken").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);
