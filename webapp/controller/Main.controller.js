sap.ui.define([
    "compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("compensar.citas.medicas.controller.Main", {
		onCargaCitas: function(){
			this.getRouter().navTo("CargaCitas");
		},
		onCargaUsuarios: function(){
			this.getRouter().navTo("CargaUsuarios");
		},
		onCitasMedicas: function(){
			this.getRouter().navTo("CitasMedicas");
		},
		onTablasVarias: function(){
			this.getRouter().navTo("TablasVarias");
		},
		/*onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true);
			}
		},*/
		
		handleRouteMatched: function(oEvent) {
            this.onGetModel();
			var valida = this.objetoEstaVacio();
			if(valida){
				this.onSalir();
			}
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("Page1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);
