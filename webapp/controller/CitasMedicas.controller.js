sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	"sap/ui/core/format/DateFormat"
], function(BaseController, MessageBox, History, exportLibrary, Spreadsheet,DateFormat) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return BaseController.extend("compensar.citas.medicas.controller.CitasMedicas", {
		onChangeFiltro: function(oEvent){
			var oFiltro = oEvent.getSource().getSelectedKey();
			if(oFiltro == 1){
				this.getView().byId("fe_tipo_paciente").setVisible(true)
				this.getView().byId("fe_nro_paciente").setVisible(true)
				this.getView().byId("fe_tipo_profesional").setVisible(false)
				this.getView().byId("fe_nro_profesional").setVisible(false)
				this.getView().byId("fe_sede").setVisible(false)
				this.getView().byId("fe_servicio").setVisible(false)
				this.getView().byId("btn-buscar").setEnabled(true)
				this.getView().byId("fe_fecha").setVisible(true)
				this.getView().byId("cbo-tipo_documento_paciente").setSelectedKey("CC")
			}else if(oFiltro == 2){
				this.getView().byId("fe_tipo_paciente").setVisible(false)
				this.getView().byId("fe_nro_paciente").setVisible(false)
				this.getView().byId("fe_tipo_profesional").setVisible(true)
				this.getView().byId("fe_nro_profesional").setVisible(true)
				this.getView().byId("fe_sede").setVisible(false)
				this.getView().byId("fe_servicio").setVisible(false)
				this.getView().byId("btn-buscar").setEnabled(true)
				this.getView().byId("fe_fecha").setVisible(true)
				this.getView().byId("cbo-tipo_documento_profesional").setSelectedKey("CC")
			}else if(oFiltro == 3){
				this.getView().byId("fe_tipo_paciente").setVisible(false)
				this.getView().byId("fe_nro_paciente").setVisible(false)
				this.getView().byId("fe_tipo_profesional").setVisible(false)
				this.getView().byId("fe_nro_profesional").setVisible(false)
				this.getView().byId("fe_sede").setVisible(true)
				this.getView().byId("fe_servicio").setVisible(false)
				this.getView().byId("btn-buscar").setEnabled(true)
				this.getView().byId("fe_fecha").setVisible(true)
			}else if(oFiltro == 4){
				this.getView().byId("fe_tipo_paciente").setVisible(false)
				this.getView().byId("fe_nro_paciente").setVisible(false)
				this.getView().byId("fe_tipo_profesional").setVisible(false)
				this.getView().byId("fe_nro_profesional").setVisible(false)
				this.getView().byId("fe_sede").setVisible(false)
				this.getView().byId("fe_servicio").setVisible(true)
				this.getView().byId("btn-buscar").setEnabled(true)
				this.getView().byId("fe_fecha").setVisible(true)
			}else{
				this.getView().byId("fe_fecha").setVisible(false)
				this.getView().byId("fe_tipo_paciente").setVisible(false)
				this.getView().byId("fe_nro_paciente").setVisible(false)
				this.getView().byId("fe_tipo_profesional").setVisible(false)
				this.getView().byId("fe_nro_profesional").setVisible(false)
				this.getView().byId("fe_sede").setVisible(false)
				this.getView().byId("fe_servicio").setVisible(false)
				this.getView().byId("btn-buscar").setEnabled(false)
			}
		},
		onDownloadCitasMedicas: function(){
			this.onExport();
		},
		onSearchCitasMedicas: function(){
			//sap.m.MessageToast.show("No se encontraron registros en Citas Medicas");
			var opciones = this.getView().byId("cbo-opciones")
			var fecha = this.getView().byId("dp-fecha").getDateValue()
			var oData = {};
			if(opciones.getSelectedKey() == 1){
				var nroDocumentoPaciente = this.getView().byId("ipt-nro_documento_paciente").getValue();
				var tipoDocumentoPaciente = this.getView().byId("cbo-tipo_documento_paciente").getSelectedKey();
				if(fecha == null || nroDocumentoPaciente.trim() == "" || tipoDocumentoPaciente == null){
					return sap.m.MessageBox.show("Ingrese los datos de búsqueda",{
						icon: MessageBox.Icon.INFORMATION,
						title: "AVISO",
					})
				}else{
					var oFecha = this.formatearFecha(fecha)
					oData = {
						fechaProgramadaCita: oFecha,
						tipoIdentificacionPaciente: tipoDocumentoPaciente,
						numeroIdentificacionPaciente: nroDocumentoPaciente
					}
				}
			}else if(opciones.getSelectedKey() == 2){
				var nroDocumentoProfesional = this.getView().byId("ipt-nro_documento_profesional").getValue();
				var tipoDocumentoProfesional = this.getView().byId("cbo-tipo_documento_profesional").getSelectedKey();
				if(fecha == null || nroDocumentoProfesional.trim() == "" || tipoDocumentoProfesional == null){
					return sap.m.MessageBox.show("Ingrese los datos de búsqueda",{
						icon: MessageBox.Icon.INFORMATION,
						title: "AVISO",
					})
				}else{
					var oFecha = this.formatearFecha(fecha)
					oData = {
						fechaProgramadaCita: oFecha,
						tipoDocumentoProfesional: tipoDocumentoProfesional,
						puntoAtencion: nroDocumentoProfesional
					}
				}
			}else if(opciones.getSelectedKey() == 3){
				var codigoSede= this.getView().byId("cbo-sede").getSelectedKey()
				if(fecha == null || codigoSede == null || codigoSede == ""){
					return sap.m.MessageBox.show("Ingrese los datos de búsqueda",{
						icon: MessageBox.Icon.INFORMATION,
						title: "AVISO",
					})
				}else{
					var oFecha = this.formatearFecha(fecha)
					oData = {
						fechaProgramadaCita: oFecha,
						codigoSedeSap: codigoSede
					}
				}
			}else if(opciones.getSelectedKey() == 4){
				var codigoServicio = this.getView().byId("ipt-codigo_servicio").getValue();
				if(fecha == null || codigoServicio.trim() == ""){
					return sap.m.MessageBox.show("Ingrese los datos de búsqueda",{
						icon: MessageBox.Icon.INFORMATION,
						title: "AVISO",
					})
				}else{
					var oFecha = this.formatearFecha(fecha)
					oData = {
						fechaProgramadaCita: oFecha,
						codPrestacionServicio: codigoServicio
					}
				}
			}else{
				return sap.m.MessageBox.show("Ingrese los datos de búsqueda",{
					icon: MessageBox.Icon.INFORMATION,
					title: "AVISO",
				})
			}
			this.onFiltrarCitasMedicas(oData)

		},
		onFiltrarCitasMedicas(oData){
			var _url = this.getApiVSM() + "api/detalleCarga/consultarCitas";
			var _this = this;
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
					_this.getView().setModel(new sap.ui.model.json.JSONModel(response),"listaCitasMedicas")
					_this.getView().getModel("listaCitasMedicas").refresh()
					// DOCUMENTO NO ENCONTRADO
					if(_this.getView().byId("cbo-tipo_documento_paciente").getSelectedKey() == "CC" && _this.getView().byId("cbo-opciones").getSelectedKey() == 1 && response.length == 0){
						sap.m.MessageBox.show("Documento no encontrado",{
							icon: MessageBox.Icon.WARNING,
							title: "Alerta"
						});
					}
					if(_this.getView().byId("cbo-tipo_documento_profesional").getSelectedKey() == "CC" && _this.getView().byId("cbo-opciones").getSelectedKey() == 2 && response.length == 0){
						sap.m.MessageBox.show("Documento no encontrado",{
							icon: MessageBox.Icon.WARNING,
							title: "Alerta"
						});
					}
					if(_this.getView().byId("cbo-opciones").getSelectedKey() == 4 && response.length == 0){
						sap.m.MessageBox.show("Código de servicio no encontrado",{
							icon: MessageBox.Icon.WARNING,
							title: "Alerta"
						});
					}
				},
				error: function (error) {
					console.error('Error al consultar informaicón de Citas:', error);
					// Manejar el error
				},
				complete: function () {
                    sap.ui.core.BusyIndicator.hide()
                }
			});
		},
		onNavMain: function(){
			this.getRouter().navTo("Page1");
		},
		handleRouteMatched: function(oEvent) {

			var oCombo = this.getView().byId("cbo-opciones")
			//oCombo.focus = oCombo.showItems()
			oCombo.setSelectedKey("")
			this.getView().byId("dp-fecha").setDateValue(null)
			this.getView().byId("cbo-tipo_documento_paciente").setSelectedKey("")
			this.getView().byId("ipt-nro_documento_paciente").setValue("")
			this.getView().byId("cbo-tipo_documento_profesional").setSelectedKey("")
			this.getView().byId("ipt-nro_documento_profesional").setValue("")
			this.getView().byId("cbo-sede").setSelectedKey("")
			this.getView().byId("ipt-codigo_servicio").setValue("")
			
			this.getView().byId("fe_fecha").setVisible(false)
			this.getView().byId("fe_tipo_paciente").setVisible(false)
			this.getView().byId("fe_nro_paciente").setVisible(false)
			this.getView().byId("fe_tipo_profesional").setVisible(false)
			this.getView().byId("fe_nro_profesional").setVisible(false)
			this.getView().byId("fe_sede").setVisible(false)
			this.getView().byId("fe_servicio").setVisible(false)
			this.getView().byId("btn-buscar").setEnabled(false)
			this.onGetTipoPaciente();
			this.onListaCitasMedicas();
			
			var oDatePicker = this.getView().byId("dp-fecha");

			var oCurrentDate = new Date();

			// Formatea la fecha según el formato esperado por el DatePicker
			var oDateFormat = DateFormat.getInstance({ pattern: "dd/MM/yyyy" });
			var sFormattedDate = oDateFormat.format(oCurrentDate);
			oDatePicker.setValue(sFormattedDate);
			oDatePicker.setDateValue(oCurrentDate);
			var valida = this.objetoEstaVacio();
			if(valida){
				this.onSalir();
			}
		},
		onListaCitasMedicas: function(){
			this.getView().setModel(new sap.ui.model.json.JSONModel([]),"listaCitasMedicas");
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("CitasMedicas").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		},
		createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				label: 'Tipo de identificación del paciente',
				property: 'tipoIdentificacionPaciente',
				type: EdmType.String
			});

			aCols.push({
				label: 'N° de identificación del paciente',
				type: EdmType.String,
				property: 'numeroIdentificacionPaciente',
			});

			aCols.push({
				label: 'Nombre de Paciente',
				property: 'nombrePaciente',
				type: EdmType.String
			});

			aCols.push({
				label: 'N° celular del paciente',
				property: 'numeroCelularPaciente',
				type: EdmType.String
			});

			aCols.push({
				label: 'Fecha programada de la cita',
				property: 'fechaProgramadaCita',
				type: EdmType.String
			});

			aCols.push({
				label: 'Hora programada de la cita',
				type: EdmType.String,
				property: 'horaProgramadaCita'
			});

			aCols.push({
				label: 'Descripción de la especialidad de la unidad organizativa',
				type: EdmType.String,
				property: 'descUnidadOrganizativa',
			});

			aCols.push({
				label: 'Código SAP de prestación del servicio',
				type: EdmType.String,
				property: 'codPrestacionServicio',
			});
			aCols.push({
				label: 'N° de autorización',
				type: EdmType.String,
				property: 'numeroAutorizacion',
			});
			aCols.push({
				label: 'Valor a pagar de la cita',
				type: EdmType.String,
				property: 'valorAPagar',
			});
			aCols.push({
				label: 'Código de aseguradora del paciente',
				type: EdmType.String,
				property: 'codAseguradoraPaciente',
			});

			aCols.push({
				label: 'Nombre de aseguradora del paciente',
				type: EdmType.String,
				property: 'nombreAseguradoraPaciente',
			});
			aCols.push({
				label: 'Punto de atención',
				type: EdmType.String,
				property: 'puntoAtencion',
			});
			aCols.push({
				label: 'Nombre Profesional',
				type: EdmType.String,
				property: 'nombreProfesional',
			});
			aCols.push({
				label: 'Nombre Sede',
				type: EdmType.String,
				property: 'nombreSede',
			});
			aCols.push({
				label: 'Código sede SAP',
				type: EdmType.String,
				property: 'codigoSedeSap',
			});

			return aCols;
		},

		onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId('tbl-citas_medicas');
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('rows');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: 'Citas Médicas.xlsx',
				worker: false // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		},
	});
}, /* bExport= */ true);
