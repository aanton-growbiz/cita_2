sap.ui.define([
	"compensar/citas/medicas/controller/BaseController",
	"sap/m/MessageBox",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library"
], function(BaseController, MessageBox, History,Fragment,Dialog,Button,mobileLibrary) {
	"use strict";
	var ButtonType = mobileLibrary.ButtonType;
	var DialogType = mobileLibrary.DialogType;
	return BaseController.extend("compensar.citas.medicas.controller.TablasVarias", {
		onChangeTab: function(oEvent){
			if(oEvent.getParameter("selectedKey") == "usuarios"){
				this.onGetUsuarios({});
			}
		},
		onGetUsuarios: function(oData){
			var _url = this.getApiVSM() + "/api/usuario/find";
			var _this = this;
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
                data: JSON.stringify(oData),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0);
                },
                success: function (data) {
					if(data){
						_this.getView().setModel(new sap.ui.model.json.JSONModel(data), "listaUser");
					}else{
						_this.getView().setModel(new sap.ui.model.json.JSONModel([]), "listaUser");
					}
					_this.getView().getModel("listaUser").refresh();
				},error: function(error){
					console.log(error);
				},
				complete: function(){
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},
		onFilterChange: function () {
			this.onGetTipoPaciente();
			var sSelectedValue = this.getView().byId("ipt-roles").getValue();
			var oTable = this.getView().byId("tbl-tabla_rol"); // Reemplaza con el ID de tu tabla
			var oBinding = oTable.getBinding("rows");
		
			if (sSelectedValue) {
				var aFilters = [];
				var aColumnsToFilter = ["descripcionParametro", "codigoParametro"]; 

				aColumnsToFilter.forEach(function (sColumn) {
				aFilters.push(new sap.ui.model.Filter(sColumn, sap.ui.model.FilterOperator.Contains, sSelectedValue));
				});

				oBinding.filter(new sap.ui.model.Filter(aFilters, false));
			} else {
				// Si no se selecciona ningún valor, quitar el filtro
				oBinding.filter([]);
			}
		},
		onEditTablasRoles: function(){
			var oTabla = this.getView().byId("tbl-tabla_rol");
			var oIndice = oTabla.getSelectedIndices()
			if(oIndice.length > 1){
				return sap.m.MessageToast.show("Seleccione solo un registro");
			}else if(oIndice.length == 0){
				return sap.m.MessageToast.show("No se ha seleccionado registro");
			}
			
			var oData = this.getView().getModel("main").getProperty("/selectRol")
			oData.valorParametro = oData.valorParametro === "true" ? true : false;
			this.onOpenDialogRol(oData);
		},
		onAddTablasRoles: function(){
			this.onOpenDialogRol()
		},
		onOpenDialogRol: function(oModel){
			Fragment.load({
				name: "compensar.citas.medicas.fragment.dialogRol",
				controller: this
			}).then(function (oDialog) {
				this._oDialog = oDialog;
				if(oModel){
					this._oDialog.setModel(new sap.ui.model.json.JSONModel(oModel), "oInfo");
				}else{
					var oDoc = {
						codigoParametro: "",
						descripcionParametro: "",
						valorParametro: true,
						codigoPadre: "ROL"
					};
					this._oDialog.setModel(new sap.ui.model.json.JSONModel(oDoc), "oInfo");
				}
				this._oDialog.open();
			}.bind(this));
		},
		onOpenDialog: function(oTipo,oModel){
			Fragment.load({
				name: "compensar.citas.medicas.fragment.dialogParametro",
				controller: this
			}).then(function (oDialog) {
				this._oDialog = oDialog;
				if(oTipo){
					var oDoc = {
						codigoParametro: "",
						descripcionParametro: "",
						codigoPadre: oTipo
					};
					this._oDialog.setModel(new sap.ui.model.json.JSONModel(oDoc), "oInfo");
				}
				if(oModel){
					this._oDialog.setModel(new sap.ui.model.json.JSONModel(oModel), "oInfo");
				}
				this._oDialog.open();
			}.bind(this));
		},
		onCloseParametro: function(){
			this._oDialog.close();
		},
		onSaveParametro: function(oEvent){
			if(this.getView().byId("idIconTabBarMulti").getSelectedKey() === "general" ){
				var oData = this._oDialog.getModel("oInfo").getData();
				var sDatos = this._oDialog.getModel("oInfo");
			}else{
				var oData = this._oDialog2.getModel("oInfo").getData();
				var sDatos = this._oDialog2.getModel("oInfo");
			}
			
			sDatos.setProperty("/msgCodigo","")
			sDatos.setProperty("/msgDescripcion","")
			var nameModel = this.getView().byId("idIconTabBarMulti").getSelectedKey() === "general" ? "listaTablaGeneral" : "listaTablaRol"
			var oModel = this.getView().getModel(nameModel).getData();
			var oDialog = oEvent.getSource().getParent();
			var oCodigo = oDialog.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getItems()[0]
			var oValor = oDialog.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getItems()[0]
			if(oData.codigoParametro.trim() == ""){
				oCodigo.setValueState("Error")
				sDatos.setProperty("/msgCodigo","Falta completar el campo")
				sDatos.refresh(true);
				oCodigo.setShowValueStateMessage(false)
				//oCodigo.setValueStateText("Falta completar el campo")
				return
			}
			if(oData.descripcionParametro.trim() == ""){
				oValor.setValueState("Error")
				sDatos.setProperty("/msgDescripcion","Falta completar el campo")
				sDatos.refresh(true);
				oValor.setShowValueStateMessage(false)
				//oValor.setValueStateText("Falta completar el campo")
				return
			}
			delete oData.createdDate;
			delete oData.modifiedDate;
			delete oData.msgDescripcion;
			delete oData.msgCodigo;
			var _url = this.getApiVSM() + "/api/parametro/save";
			var _this = this;
			/**/
			var aValida = oModel.filter(o => o.codigoParametro === oData.codigoParametro && o.id !== oData.id);
			if(aValida.length > 0 ){
				sDatos.setProperty("/msgCodigo","El código ingresados ya existe")
				return 
			}
			/**/ 
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
                data: JSON.stringify(oData),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					_this.onGetTipoPaciente();
					_this.onListTablaGeneral();
					_this.onListRol();
					_this.onCloseParametro();
					_this.getView().byId("tbl-tabla_general").clearSelection();
					_this.getView().byId("tbl-tabla_rol").clearSelection();
					sap.m.MessageBox.show("Se ha " + (oData.id ? 'editado': 'agregado') +" con éxito",{
						icon: MessageBox.Icon.INFORMATION,
						title: "Mensaje",
					});
                },
                error: function (data) {
					console.log(data)
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()
                }
            });
		},
		onGetUser: function(oEvent){
			if(oEvent.getParameter("rowContext")){
				this.getView().getModel("main").setProperty("/selectUser",oEvent.getParameter("rowContext").getObject());
			}
		},
		onEditUser: function(oEvent){
			var oTabla = this.getView().byId("tbl-tabla_user");
			var oIndice = oTabla.getSelectedIndices()
			if(oIndice.length > 1){
				return sap.m.MessageToast.show("Seleccione solo un usuario");
			}else if(oIndice.length == 0){
				return sap.m.MessageToast.show("No se ha seleccionado usuario");
			}
			
			var oData = this.getView().getModel("main").getProperty("/selectUser")
			this.onOpenDialogUser(oData);
		},
		onOpenDialogUser: function(oModel){
			Fragment.load({
				name: "compensar.citas.medicas.fragment.dialogUser",
				controller: this
			}).then(function (oDialog) {
				this._oDialog3 = oDialog;
				if(oModel){
					this._oDialog3.setModel(new sap.ui.model.json.JSONModel(oModel), "oInfo");
				}
				this._oDialog3.open();
			}.bind(this));
		},
		onSaveUsuario: function(oEvent){
			var oData = this._oDialog3.getModel("oInfo").getData();
			var sDatos = this._oDialog3.getModel("oInfo");
			sDatos.setProperty("/msgCodigo","")
			sDatos.setProperty("/msgDescripcion","")
			var oModel = this.getView().getModel("listaUser").getData();
			var oDialog = oEvent.getSource().getParent();
			var oCodigo = oDialog.getContent()[0].getFormContainers()[0].getFormElements()[0].getFields()[0].getItems()[0]
			var oValor = oDialog.getContent()[0].getFormContainers()[0].getFormElements()[1].getFields()[0].getItems()[0]
			delete oData.createdDate;
			delete oData.modifiedDate;
			delete oData.msgDescripcion;
			delete oData.msgCodigo;
			var _url = this.getApiVSM() + "/api/usuario/save";
			var _this = this;
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
                data: JSON.stringify(oData),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					_this.onGetUsuarios({});
					_this.onCloseUser();
					_this.getView().byId("tbl-tabla_user").clearSelection();
					sap.m.MessageBox.show("Se ha " + (oData.id ? 'editado': 'agregado') +" con éxito",{
						icon: MessageBox.Icon.INFORMATION,
						title: "Mensaje",
					});
                },
                error: function (data) {
					console.log(data)
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()
                }
            });
		},
		onCloseUser: function(){
			this._oDialog3.close();
		},
		onGetParametro: function(oEvent){
			if(oEvent.getParameter("rowContext")){
				this.getView().getModel("main").setProperty("/selectGeneral",oEvent.getParameter("rowContext").getObject());
			}
		},
		onGetRol: function(oEvent){
			if(oEvent.getParameter("rowContext")){
				this.getView().getModel("main").setProperty("/selectRol",oEvent.getParameter("rowContext").getObject());
			}
		},
		onCloseRol: function(){
			this._oDialog2.close();
		},
		onDeleteParametro: function(oData){
			var _url = this.getApiVSM() + "/api/parametro/"+ oData.id;
			var _this = this;
			$.ajax({
                type: "DELETE",
                url: _url,
                contentType: "application/json",
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					
					sap.m.MessageBox.show("Se ha eliminado con éxito",{
						icon: MessageBox.Icon.INFORMATION,
						title: "Mensaje",
					});
					_this.onGetTipoPaciente();
					_this.onListTablaGeneral();
					_this.onListRol();
					_this.getView().byId("tbl-tabla_general").clearSelection();
					_this.getView().byId("tbl-tabla_rol").clearSelection();
                },
                error: function (data) {
					
					sap.m.MessageBox.show("Ocurrió un error al ejecutar esta acción",{
						icon: MessageBox.Icon.ERROR,
						title: "Mensaje",
					});
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()
                }
            });
		},
		onDeleteTablasRoles: function(oEvent){
			var _this = this;

			var oTabla = this.getView().byId("tbl-tabla_rol");
			var oIndice = oTabla.getSelectedIndices()
			if(oIndice.length > 1){
				return sap.m.MessageToast.show("Seleccione solo un registro");
			}else if(oIndice.length == 0){
				return sap.m.MessageToast.show("No se ha seleccionado registro");
			}

			if (!this.oApproveDialog) {
				this.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: "Ventana de Confirmación",
					content: new sap.m.Text({ text: "¿Deseas Eliminar?" }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Aceptar",
						press: function () {
							var oData = this.getView().getModel("main").getProperty("/selectRol")
							_this.onDeleteParametro(oData);
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancelar",
						press: function () {
							this.oApproveDialog.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog.open();
		},
		onDeleteTablasVarias: function(oEvent){
			var _this = this;

			var oTabla = this.getView().byId("tbl-tabla_general");
			var oIndice = oTabla.getSelectedIndices()
			if(oIndice.length > 1){
				return sap.m.MessageToast.show("Seleccione solo un registro");
			}else if(oIndice.length == 0){
				return sap.m.MessageToast.show("No se ha seleccionado registro");
			}
			

			if (!this.oApproveDialog2) {
				this.oApproveDialog2 = new Dialog({
					type: DialogType.Message,
					title: "Ventana de Confirmación",
					content: new sap.m.Text({ text: "¿Deseas Eliminar?" }),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Aceptar",
						press: function () {
							var oData = this.getView().getModel("main").getProperty("/selectGeneral")
							_this.onDeleteParametro(oData);
							this.oApproveDialog2.close();

						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancelar",
						press: function () {
							this.oApproveDialog2.close();
						}.bind(this)
					})
				});
			}

			this.oApproveDialog2.open();
		},
		onEditTablasVarias: function(oEvent){
			var oTabla = this.getView().byId("tbl-tabla_general");
			var oIndice = oTabla.getSelectedIndices()
			if(oIndice.length > 1){
				return sap.m.MessageToast.show("Seleccione solo un registro");
			}else if(oIndice.length == 0){
				return sap.m.MessageToast.show("No se ha seleccionado registro");
			}
			
			var oData = this.getView().getModel("main").getProperty("/selectGeneral")
			this.onOpenDialog(false,oData);
		},
		onAddTablasVarias: function(){
			var oTipo = this.getView().byId("cbo-tabla_general").getSelectedKey();
			if(this.getView().getModel("listaTablaGeneral").getData().length > 0){
				this.onOpenDialog(oTipo,false);
			}else{
				sap.m.MessageToast.show("No ha seleccionado Tabla General")
			}
			
		},
		onChangeFiltro: function(oEvent){
			var oFiltro = oEvent.getSource().getSelectedKey();
			if(oFiltro == "SEDE"){
				this.getView().byId("btn-buscar").setEnabled(true)
			}else if(oFiltro == "DOC_PACIENTE"){
				this.getView().byId("btn-buscar").setEnabled(true)
			}else if(oFiltro == "DOC_PROFESIONAL"){
				this.getView().byId("btn-buscar").setEnabled(true)
			}else{
				this.getView().byId("btn-buscar").setEnabled(false)
			}
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
			this.onGetTipoPaciente();

			this.getView().byId("btn-buscar").setEnabled(false)
			this.getView().byId("btn-add_general").setEnabled(false)
			this.getView().byId("btn-edit_general").setEnabled(false)
			this.getView().byId("btn-delete_general").setEnabled(false)
			this.getView().byId("cbo-tabla_general").setSelectedKey("")
			
			this.getView().setModel(new sap.ui.model.json.JSONModel([]), "listaTablaGeneral");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "main");
			this.getView().setModel(new sap.ui.model.json.JSONModel({}), "oTokenInfo");

			this.onListRol();
			this.onListToken();
			var valida = this.objetoEstaVacio();
			if(valida){
				this.onSalir();
			}
		},
		onListRol: function(){
			var oData = this.getView().getModel("listaDocumentoPaciente").getData().filter(oItem => oItem.codigoPadre == "ROL");
			this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "listaTablaRol");
			this.getView().getModel("listaTablaRol").refresh()
		},
		onListToken: function(){
			var oData = this.getView().getModel("listaDocumentoPaciente").getData().filter(oItem => oItem.codigoPadre == "TOKEN");
			
			var obj = {};
			console.log(oData)
			oData.forEach(function(oItem){
				if(oItem.codigoParametro == "PLANTILLA"){
					obj.plantilla = oItem;
				}
				if(oItem.codigoParametro == "ASUNTO"){
					obj.asunto = oItem;
				}
				if(oItem.codigoParametro == "SISTEMA"){
					obj.sistema = oItem;
				}
				if(oItem.codigoParametro == "TIEMPO"){
					obj.tiempo = oItem;
				}
			});
			this.getView().setModel(new sap.ui.model.json.JSONModel(obj), "listaTablaToken");
			this.getView().getModel("listaTablaToken").refresh()
		},
		onUpdateToken: function(){
			var oToken = [],
			oData = this.getView().getModel("listaTablaToken").getData();

			this.getView().getModel("oTokenInfo").setProperty("/msgPlantilla","")
			this.getView().getModel("oTokenInfo").setProperty("/msgAsunto","")
			this.getView().getModel("oTokenInfo").setProperty("/msgSistema","")
			this.getView().getModel("oTokenInfo").setProperty("/msgTiempo","")
			var cantidadErrores = 0;
			if(oData.plantilla.valorParametro.trim() == ""){
				var oInput = this.getView().byId("ipt-plantilla-valor")
				oInput.focus()
				oInput.setValueState("Error")
				oInput.setShowValueStateMessage(false)
				this.getView().getModel("oTokenInfo").setProperty("/msgPlantilla","Falta completar el campo")
				//oInput.setValueStateText("Falta completar el campo")
				cantidadErrores++;
			}
			if(oData.asunto.valorParametro.trim() == ""){
				var oInput = this.getView().byId("ipt-asunto-valor")
				oInput.focus()
				oInput.setValueState("Error")
				oInput.setShowValueStateMessage(false)
				
				this.getView().getModel("oTokenInfo").setProperty("/msgAsunto","Falta completar el campo")
				cantidadErrores++;
			}
			if(oData.sistema.valorParametro.trim() == ""){
				var oInput = this.getView().byId("ipt-sistema-valor")
				oInput.focus()
				oInput.setValueState("Error")
				oInput.setShowValueStateMessage(false)
				this.getView().getModel("oTokenInfo").setProperty("/msgSistema","Falta completar el campo")
				
				cantidadErrores++;
			}
			if(oData.tiempo.valorParametro.trim() == ""){
				var oInput = this.getView().byId("ipt-tiempo-valor")
				oInput.focus()
				oInput.setValueState("Error")
				oInput.setShowValueStateMessage(false)
				this.getView().getModel("oTokenInfo").setProperty("/msgTiempo","Falta completar el campo")
				cantidadErrores++;
			}
			if(cantidadErrores > 0 ){
				return
			}
			delete oData.plantilla.createdDate;
			delete oData.plantilla.modifiedDate;
			delete oData.asunto.createdDate;
			delete oData.asunto.modifiedDate;
			delete oData.sistema.createdDate;
			delete oData.sistema.modifiedDate;
			delete oData.tiempo.createdDate;
			delete oData.tiempo.modifiedDate;

			oToken.push(oData.plantilla);
			oToken.push(oData.asunto);
			oToken.push(oData.sistema);
			oToken.push(oData.tiempo);

			var _url = this.getApiVSM() + "/api/parametro/saveAll";
			var _this = this;
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
                data: JSON.stringify(oToken),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					_this.onGetTipoPaciente();
					_this.onListToken();
					sap.m.MessageBox.show("Se ha actualizado los datos con éxito",{
						icon: MessageBox.Icon.INFORMATION,
						title: "Mensaje",
					});
                },
                error: function (data) {
					console.log(data)
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()
                }
            });
		},
		onListTablaGeneral: function(){
			this.onGetTipoPaciente();
			var oFiltro = this.getView().byId("cbo-tabla_general").getSelectedKey()
			var oData = this.getView().getModel("listaDocumentoPaciente").getData().filter(oItem => oItem.codigoPadre == oFiltro);
			this.getView().setModel(new sap.ui.model.json.JSONModel(oData), "listaTablaGeneral");
			this.getView().byId("btn-add_general").setEnabled(true)
			if(oData.length>0){
				this.getView().byId("btn-edit_general").setEnabled(true)
				this.getView().byId("btn-delete_general").setEnabled(true)
			}
			this.getView().getModel("listaTablaToken").refresh()
		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("TablasVarias").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

		}
	});
}, /* bExport= */ true);
