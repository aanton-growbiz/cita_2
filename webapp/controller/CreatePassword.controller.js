sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, History) {
	"use strict";
	var modelGeneral;
	return BaseController.extend("compensar.citas.medicas.controller.CreatePassword", {
		onCreatePassword: function(){
			var pass = this.getView().byId("ipt-nueva_pass"), repas = this.getView().byId("ipt-repite_pass");
			modelGeneral.setProperty("/msgPassword","");
			if(pass.getValue() != repas.getValue()){
				modelGeneral.setProperty("/msgPassword","  *  Las contraseñas no son iguales");
				this.getView().byId("lbl-1").removeStyleClass("msgErrorTexto")
				this.getView().byId("lbl-2").removeStyleClass("msgErrorTexto")
				this.getView().byId("lbl-3").removeStyleClass("msgErrorTexto")
				return;
			}
			var _url = this.getApiVSM() + "api/usuario/cambiarContrasenna";
			var _this = this;
			
			var oData = this.getView().getModel("modelGeneral").getData();
			
			var oBody = {
				"nuevaContrasenna": pass.getValue(),
				"token": oData.tValidado,
				"username": oData.username
				}
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
				data: JSON.stringify(oBody),
                dataType: "json",
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (response) {
					_this.getView().byId("lbl-1").removeStyleClass("msgErrorTexto")
					_this.getView().byId("lbl-2").removeStyleClass("msgErrorTexto")
					_this.getView().byId("lbl-3").removeStyleClass("msgErrorTexto")
					sap.m.MessageToast.show("Se creo nueva contraseña");
					_this.onNavLogin();
                },
                error: function (data) {
					modelGeneral.setProperty("/msgPassword","  *  La contraseña no cumple con el criterio establecido");
					_this.getView().byId("lbl-1").addStyleClass("msgErrorTexto")
					_this.getView().byId("lbl-2").addStyleClass("msgErrorTexto")
					_this.getView().byId("lbl-3").addStyleClass("msgErrorTexto")
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()

                }
            });

			
		},
		onNavLogin: function(){
			this.getRouter().navTo("RouteloginPage");
		},
		handleRouteMatched: function(oEvent) {
			this.onGetModel();
			modelGeneral = this.getView().getModel("modelGeneral");
			this.getView().byId("lbl-1").removeStyleClass("msgErrorTexto")
			this.getView().byId("lbl-2").removeStyleClass("msgErrorTexto")
			this.getView().byId("lbl-3").removeStyleClass("msgErrorTexto")
			
			modelGeneral.setProperty("/msgPassword","");
			this.getView().byId("ipt-nueva_pass").setValue("");
			this.getView().byId("ipt-repite_pass").setValue("");
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("CreatePassword").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);
