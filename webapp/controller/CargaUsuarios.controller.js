sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";
	var modelGeneral;
	return BaseController.extend("compensar.citas.medicas.controller.CargaUsuarios", {
		onCargaUsuarios: function(oEvent){
            var file = oEvent.getParameter("files")[0]

			var _url = this.getApiVSM() + "api/usuario/uploadExcel";
			var _this = this;
			var oUser = sap.ui.getCore().getModel("modelGeneral");
			var formData = new FormData();
			formData.append('file', file);
			formData.append('user', oUser.getProperty("/usuario/nombreLogin"));
	
			$.ajax({
				type: 'POST',
				url: _url,
				data: formData,
				contentType: false,
				processData: false,
				async: true,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
				success: function (response) {
					
					var _url = _this.getApiVSM() + "api/rol/uploadExcel";
					$.ajax({
						type: 'POST',
						url: _url,
						data: formData,
						contentType: false,
						processData: false,
						async: true,
						beforeSend: function () {
							sap.ui.core.BusyIndicator.show(0)
						},
						success: function (response) {
							sap.m.MessageBox.show("Se cargó información de Roles y Usuarios",{
								icon: MessageBox.Icon.INFORMATION,
								title: "Aviso"
							})
							_this.onGetCargaCitas({})
						},
						error: function (error) {
							sap.m.MessageBox.show('Error al enviar el archivo:'+ error.responseText,{
								icon: MessageBox.Icon.INFORMATION,
								title: "Aviso"
							});
							// Manejar el error
						},
						complete: function () {
							sap.ui.core.BusyIndicator.hide()
						}
					});
					//_this.onGetCargaCitas({})
				},
				error: function (error) {
					sap.m.MessageBox.show('Error al enviar el archivo:'+ error.responseText,{
						icon: MessageBox.Icon.INFORMATION,
						title: "Aviso"
					});
					// Manejar el error
				},
				complete: function () {
                    //sap.ui.core.BusyIndicator.hide()
                }
			});
			
		},
		onChangeFiltro: function(oEvent){
		},
		onChangeRol: function(){
			this.getView().byId("btn-buscar-rol").setEnabled(true)
		},
		onDownloadCitasMedicas: function(){
			sap.m.MessageToast.show("Descarga de Citas Médicas");
		},
		onSearchCitasMedicas: function(){
			sap.m.MessageToast.show("Búsqueda Citas Médicas");
		},
		onNavMain: function(){
			this.getRouter().navTo("Page1");
		},
		onSearchCargaCitas: function(){
			var fecha = this.getView().byId("dp-fecha");
			var oFecha = fecha.getDateValue();
			var oData = {}
			
			if(fecha.getValue() == ""){
				oData = {};
			}else{
				if( oFecha == null){
					sap.m.MessageBox.show("Ingrese una fecha valida")
				}else{
					oFecha = this.formatearFecha(oFecha)
					oData = {
						fechaRegistro: oFecha
					}
				}
			}
			this.onGetCargaCitas(oData)
		},
		onGetCargaCitas: function(param){
			var _url = this.getApiVSM() + "api/carga/find";
			var _this = this;
			//var oUser = sap.ui.getCore().getModel("infoUsuario").getData();
			var oData = param;
			$.ajax({
				type: 'POST',
				url: _url,
				contentType: "application/json",
                data: JSON.stringify(oData),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
				success: function (response) {
					response = response.filter(item => item.indCargaUsuario === true)
					response.forEach(function(oItem){
						const fecha = oItem.createdDate;
						const [fechaPart, horaPart] = fecha.split(' ');
						const [dia, mes, anio] = fechaPart.split('/');
						const [hora, minutos, segundos] = horaPart.split(':');
						// Convertir las cadenas a números
						const anioNum = parseInt(anio, 10);
						const mesNum = parseInt(mes, 10) - 1; // Restamos 1 porque los meses en JavaScript van de 0 a 11
						oItem.createdDate = new Date(anioNum, mesNum, dia, hora, minutos, segundos);
					});
					_this.getView().setModel(new sap.ui.model.json.JSONModel(response),"logCitas")
					_this.getView().getModel("logCitas").refresh(true)
				},
				error: function (error) {
					console.error('Error al consultar información de Usuarios:', error);
					// Manejar el error
				},
				complete: function () {
                    sap.ui.core.BusyIndicator.hide()
                }
			});
		},
		handleRouteMatched: function(oEvent) {
			this.onGetModel();
			modelGeneral = this.getView().getModel("modelGeneral")
			this.getView().byId("btn-buscar").setEnabled(true)
			this.onGetCargaCitas({})
			var valida = this.objetoEstaVacio();
			if(valida){
				this.onSalir();
			}
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("CargaUsuarios").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);
