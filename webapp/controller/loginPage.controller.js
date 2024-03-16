sap.ui.define([
    "compensar/citas/medicas/controller/BaseController",
    "sap/m/Input",
    "sap/m/InputBase"
], function (BaseController,Input,InputBase) {
        "use strict";
        var modelGeneral;
        return BaseController.extend("compensar.citas.medicas.controller.loginPage", {
            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			    this.oRouter.getTarget("TargetloginPage").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            },
            handleRouteMatched: function(oEvent){
                
                this.getView().byId("ipt-password").setValue("")
                this.getView().byId("ipt-username").setValue("")

                sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel({}),"modelGeneral");
                modelGeneral = this.getView().getModel("modelGeneral");

                Input.prototype.onfocusin = function(oEvent) {
                    InputBase.prototype.onfocusin.apply(this, arguments);
                    this.addStyleClass("sapMInputFocused");
                    
                    var sInputId = this.getId();
                    if (sInputId.indexOf("ipt-ingreso_token") >= 0) {
                        sap.ui.getCore().getModel("modelGeneral").setProperty("/bInputToken",true)
                    }else{
                        sap.ui.getCore().getModel("modelGeneral").setProperty("/bInputToken",false)
                    }
                    // Close the ValueStateMessage when the suggestion popup is being opened.
                    // Only do this in case a popup is used.
                    if (!this.isMobileDevice() && this._isSuggestionsPopoverOpen()) {
                        this.closeValueStateMessage();
                    }
            
                    // fires suggest event when startSuggestion is set to 0 and input has no text
                    if (this._shouldTriggerSuggest()) {
                        this._triggerSuggest(this.getValue());
                    }
                    this._bPopupHasFocus = undefined;
            
                    this._sPrevSuggValue = null;
                };
            },
            onNavToMain : function () {
                var oUser = this.getView().byId("ipt-username"),
                oPass = this.getView().byId("ipt-password");
                modelGeneral.setProperty("/newUsuario",false);
                this.validaIniciarSesion(oUser,oPass);
            },
            onNavToNew: function(){
                modelGeneral.setProperty("/newUsuario",true);
                sap.m.MessageToast.show("Nuevo Registro");
                this.onSetModel();
                this.getRouter().navTo("Page3")
            }
        });
    });
