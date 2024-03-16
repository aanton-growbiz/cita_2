sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, History) {
	"use strict";

	return BaseController.extend("compensar.citas.medicas.controller.NewPassword", {
		onSendToken: function(){
			var oDocumento = this.getView().byId("ipt-num_documento"),
			numDocumento = oDocumento.getValue()
			var _this = this;
			var oData = {
				"username": numDocumento
				};
			_this.generaToken(oData)
		},
		onAfterRendering: function(){
			this.getView().getModel("modelGeneral").setProperty("/reenviaToken",false)
		},
		onNavToken: function(_this){
			_this.getRouter().navTo("PageToken");
		},
		handleRouteMatched: function(oEvent) {
			this.onGetModel();
			this.getView().getModel("modelGeneral").setProperty("/reenviaToken",false)
			this.getView().byId("ipt-num_documento").setValue("")
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page3").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);
