sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	"sap/m/MessageBox"
], function(Controller, History, UIComponent,MessageBox) {
	"use strict";
	return Controller.extend("compensar.citas.medicas.controller.BaseController", {
		getApiVSM: function(){
			//return "https://compensarbackend.cfapps.us10.hana.ondemand.com/";
			return "./backend/";
		},
		onSalir : function () {
			this.getRouter().navTo("RouteloginPage");
		},
		onGetModel: function(){
			var oData = sap.ui.getCore().getModel("modelGeneral").getData();
			this.getView().setModel(new sap.ui.model.json.JSONModel(oData),"modelGeneral")
		},
		onSetModel: function(){
			var oData = this.getView().getModel("modelGeneral").getData();
			sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(oData),"modelGeneral")
		},
		formatFecha: function(createdDate){
			if(createdDate === null){
				return createdDate;
			}
			
			var partes = createdDate.split(/[\s/:\-]/);
			var fecha = new Date(partes[2], partes[1] - 1, partes[0], partes[3], partes[4], partes[5]);
			if (isNaN(fecha.getTime())) {
				return createdDate;
			}
			fecha.setHours(fecha.getHours() - 5);
			return fecha.toLocaleString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });

		},
		objetoEstaVacio: function() {
			var objeto = sap.ui.getCore().getModel("modelGeneral").getData();
			var response = true

			for(var clave in objeto) {
				if(objeto.hasOwnProperty(clave)){
					response = false;
				}
			}
			return response;
		},
		onNavBack: function() {
			const oHistory = History.getInstance();
			const sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				const oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
			}
		},
		handleInputChange: function (oEvent) {
			if(sap.ui.getCore().getModel("modelGeneral").getProperty("/textoPegado") != ""){
				var oInput = oEvent.getSource();
				var aInputs = oInput.getParent().getContent()
				var bValue = false, 
				sToken = sap.ui.getCore().getModel("modelGeneral").getProperty("/textoPegado");
				aInputs.forEach(function(oItem){
					if(oItem == oEvent.getSource()){
						bValue = true
					}
					if(bValue){
						oItem.setValue(sToken.slice(0,1))
						sToken = sToken.slice(1)
					}
				});
				sap.ui.getCore().getModel("modelGeneral").setProperty("/textoPegado","")
			}else{
				var oInput = oEvent.getSource();
				var sValue = oInput.getValue();
				if (sValue.length === 1) {
					var aInputs = oInput.getParent().getContent()
					var iCurrentIndex = aInputs.indexOf(oInput);
					if (iCurrentIndex < aInputs.length - 1) {
						aInputs[iCurrentIndex + 1].focus();
					}
				}
			}
		},
		validaIniciarSesion: function(oUser,oPass){
			var _url = this.getApiVSM() + "api/auth/iniciarSesion";
			var _this = this;
			var modelGeneral = this.getView().getModel("modelGeneral");
			var oData = {
				"password": oPass.getValue(),
				"username": oUser.getValue()
			  }
			$.ajax({
                type: "POST",
                url: _url,
				contentType: "application/json",
				dataType: "json",
                data: JSON.stringify(oData),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					if(data.token == "Acceso no permitido"){
						modelGeneral.setProperty("/msgLogin","  *  Usuario no permitido para ingreso");
					}else{
						data.correo = data.usuario.correo//"u*********@compensarsalud.com",
						data.nombreLogin = data.usuario.nombreUsuario//"PROFILE"
						modelGeneral.setProperty("/msgLoginPermisos","")
						modelGeneral.setProperty("/usuario",data)
						_this.generaToken(data);
					}
                },error: function (data) {
					if(Object.keys(data.responseJSON).length === 0){
						modelGeneral.setProperty("/msgLogin","  *  Documento Incorrecto")
					}else if(data.responseJSON.error === "There is no PasswordEncoder mapped for the id \"null\""){
						modelGeneral.setProperty("/msgLogin","  *  La contraseña es incorrecta")
					}else{
						modelGeneral.setProperty("/msgLogin","  *  Error: Comuníquese con nuestro equipo sobre este error")
					}
                },complete: function () {
                    sap.ui.core.BusyIndicator.hide();
					modelGeneral.refresh(true);
                }
            });
		},
		validacionToken: function(oData){
			var _url = this.getApiVSM() + "api/auth/validacionToken";
			var _this = this;
			var modelGeneral = this.getView().getModel("modelGeneral");;
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
				data: JSON.stringify(oData),
                dataType: "json",
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0);
                },
                success: function (response) {
					if(response.token.length > 6 ){
						modelGeneral.setProperty("/msgToken","  *   Token inválido")
					}else{
						if(modelGeneral.getProperty("/newUsuario")){
							_this.onSetModel();
							modelGeneral.setProperty("/tValidado",oData.token)
							_this.getRouter().navTo("CreatePassword");
						}else{
							_this.onSetModel();
							modelGeneral.setProperty("/tValidado","")
							_this.getRouter().navTo("Page1");
						}	
					}
					
                },
                error: function (data) {
					sap.m.MessageBox.show("Ocurrio un error al Iniciar Sesión")
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()

                }
            });
		},
		generaToken: function(oData){			
			var _url = this.getApiVSM() + "api/auth/generarToken";
			var _this = this;
			var modelGeneral = this.getView().getModel("modelGeneral");
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
				data: JSON.stringify({
					"username": oData.username
				}),
                dataType: "json",
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (response) {
					if(response.token.length > 6){
						modelGeneral.setProperty("/msgGeneraToken","  *  " + response.token);
					//if(response.token == "No se encontró Usuario" || response.token == "Acceso no permitido"){
					//	modelGeneral.setProperty("/msgGeneraToken","  *  Acceso no permitido");
					}else{
						//response.correo = "u*********@compensarsalud.com",
						//response.nombreLogin = "PROFILE"
						modelGeneral.setProperty("/usuario/token",response.token)
						modelGeneral.setProperty("/msgGeneraToken","")
						//modelGeneral.setProperty("/msgReenvíaToken","  *  Se ha generado un nuevo token.")
						modelGeneral.setProperty("/username",oData.username)
						if(modelGeneral.getProperty("/reenviaToken")){
							modelGeneral.setProperty("/msgToken","  *  Se ha generado un nuevo token")
						}
						sap.m.MessageBox.show("Se ha generado nuevo token : " + response.token,{
							icon: MessageBox.Icon.INFORMATION,
							title: "Token",
							onClose: function(){
								_this.onSetModel();
								_this.getRouter().navTo("PageToken");
							}

						});
					}
					
                },
                error: function (data) {
					modelGeneral.setProperty("/msgGeneraToken","  *  Error: Comuníquese con nuestro equipo sobre este error");
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()
					modelGeneral.refresh(true);

                }
            });
		},
		onGetTipoPaciente: function(){
			var _url = this.getApiVSM() + "api/parametro/findAll";
			var _this = this;
			$.ajax({
                type: "GET",
                url: _url,
                contentType: "application/json",
                dataType: "json",
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					console.log(data)
					if(data){
						_this.getView().setModel(new sap.ui.model.json.JSONModel(data), "listaDocumentoPaciente");
					}else{
						_this.getView().setModel(new sap.ui.model.json.JSONModel([]), "listaDocumentoPaciente");
					}
					_this.getView().getModel("listaDocumentoPaciente").refresh();
                },
                error: function (data) {
					console.log(data)
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()

                }
            });
		},
		onGetCitas: function(param){
			var _url = this.getApiVSM() + "api/detalleCarga/consultarCitas";
			var _this = this;
			var oData = param;
			$.ajax({
                type: "POST",
                url: _url,
                contentType: "application/json",
                dataType: "json",
				data: JSON.stringify(oData),
                async: false,
                beforeSend: function () {
                    sap.ui.core.BusyIndicator.show(0)
                },
                success: function (data) {
					console.log(data)
					if(data){
						_this.getView().setModel(new sap.ui.model.json.JSONModel(data), "listaCitas");
					}else{
						_this.getView().setModel(new sap.ui.model.json.JSONModel([]), "listaCitas");
					}
					_this.getView().getModel("listaCitas").refresh();
                },
                error: function (data) {
					console.log(data)
                },
                complete: function () {
                    sap.ui.core.BusyIndicator.hide()

                }
            });
		},
		formatearFecha: function(fecha) {
			if(fecha){
				// Obtener componentes de la fecha
				var dia = fecha.getDate();
				var mes = fecha.getMonth() + 1; // Los meses en JavaScript son indexados desde 0
				var año = fecha.getFullYear();
			
				// Agregar ceros iniciales si es necesario
				dia = dia < 10 ? '0' + dia : dia;
				mes = mes < 10 ? '0' + mes : mes;
			
				// Formatear la fecha como "dd/mm/yyyy"
				var fechaFormateada = dia + '/' + mes + '/' + año;
			
				return fechaFormateada;
			}
			
		},
		onVisiblePass: function(oEvent){
			var typeInput= oEvent.getSource().getType();
			if(typeInput == "Text"){
				oEvent.getSource().setType("Password");
			}else{
				oEvent.getSource().setType("Text");
			}
			
		},
		getRouter : function () {
			return UIComponent.getRouterFor(this);
		},
		onRestartInput: function(oEvent){
			if(oEvent.getParameter("value").length>0){
				oEvent.getSource().setValueState("None")
				oEvent.getSource().setShowValueStateMessage(false)
				oEvent.getSource().setValueStateText("")
			}
		}

	});

});
document.addEventListener('paste', function (event) {
    // Obtener el texto pegado desde el portapapeles
    var clipboardData = (event.clipboardData || window.clipboardData);
    var pastedText = clipboardData.getData('text');
	if(sap.ui.getCore().getModel("modelGeneral").getProperty("/bInputToken")){
		sap.ui.getCore().getModel("modelGeneral").setProperty("/textoPegado",pastedText);
	}else{
		sap.ui.getCore().getModel("modelGeneral").setProperty("/textoPegado","");
	}
    
});