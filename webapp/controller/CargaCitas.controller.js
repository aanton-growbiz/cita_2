sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, History) {
	"use strict";
	var modelGeneral;
	return BaseController.extend("compensar.citas.medicas.controller.CargaCitas", {
		onCargaCitasMedicas: function(oEvent){
            var file = oEvent.getParameter("files")[0]

			var _url = this.getApiVSM() + "api/carga/cargarArchivo";
			var _this = this;

			var user = modelGeneral.getProperty("/usuario/nombreLogin")
			//var oUser = sap.ui.getCore().getModel("infoUsuario").getData();
			var formData = new FormData();
			formData.append('file', file);
			formData.append('user', user);
			oEvent.getSource().setValue("");
			$.ajax({
				type: 'POST',
				url: _url,
				data: formData,
				contentType: false,
				processData: false,
				async: true,
				success: function (response) {
					console.log(response)
				},
				error: function (error) {
					console.log(error)
				}
			});
			var oData = _this.getView().getModel("logCitas").getData()
			var nuevoArreglo = oData
				.filter(objeto => objeto.idEstado === 1)
				.map(objeto => ({ ...objeto, idEstado: 0 }));
			
			var _url = this.getApiVSM() + "api/carga/saveAll";
			$.ajax({
				type: 'POST',
				url: _url,
				contentType: "application/json",
                data: JSON.stringify(nuevoArreglo),
                async: true,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
				success: function (response) {
					response = response.filter(item => item.indCargaUsuario === false)
					_this.getView().setModel(new sap.ui.model.json.JSONModel(response),"logCitas")
					_this.getView().getModel("logCitas").refresh(true)
				},
				error: function (error) {
					console.error('Error al consultar información de Citas:', error);
				},
				complete: function () {
                    sap.ui.core.BusyIndicator.hide()
					sap.m.MessageBox.show("Se cargó información de Citas Médicas. \nEstado: Pendiente",{
						icon: MessageBox.Icon.INFORMATION,
						title: "Aviso"
					});
					_this.onGetCargaCitas({})
                }
			});		
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
					response = response.filter(item => item.indCargaUsuario === false)
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
					console.error('Error al consultar información de Citas:', error);
					// Manejar el error
				},
				complete: function () {
                    sap.ui.core.BusyIndicator.hide()
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
			this.oRouter.getTarget("CargaCitas").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		}
	});
}, /* bExport= */ true);
