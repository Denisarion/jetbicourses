/*global location history */
sap.ui.define([
	"zjblesson/Worklist/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"zjblesson/Worklist/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/Dialog"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator, MessageToast, Dialog) {
	"use strict";

	return BaseController.extend("zjblesson.Worklist.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function(oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		onPressSayHello: function(oEvent) {
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var stext = oResourceBundle.getText("tSayHello");

			MessageToast.show(stext);
		},

		onPressCreate: function() {
			if (!this.oDialogCreate) {
				this.oDialogCreate = new Dialog({
					title: "Create new Material",
					type: "Message",
					contentWidth: "25rem",
					content: [
						new sap.m.Label({
							text: "MaterialText",
							labelFor: "MaterialTextCreate"
						}),
						new sap.m.Input("MaterialTextCreate", {
							width: "100%"
						}),
						new sap.m.Label({
							text: "GroupID",
							labelFor: "GroupIDCreate"
						}),
						new sap.m.Input("GroupIDCreate", {
							width: "100%"
						}),
						new sap.m.Label({
							text: "SubGroupID",
							labelFor: "SuGroupIDCreate"
						}),
						new sap.m.Input("SubGroupIDCreate", {
							width: "100%"
						})
					],
					beginButton: new sap.m.Button({
						type: "Emphasized",
						text: "Create",
						press: function() {
							this._createMaterial();
							this.oDialogCreate.close();
						}.bind(this)
					}),
					endButton: new sap.m.Button({
						text: "Cancel",
						press: function() {
							this.oDialogCreate.close();
							this.oDialogCreate.getContent()[1].setValue("");
							this.oDialogCreate.getContent()[3].setValue("");
							this.oDialogCreate.getContent()[5].setValue("");
						}.bind(this)
					})

				}).addStyleClass("sapUISizeCompact");
				this.getView().addDependent(this.oDialogCreate);
			}
			this.oDialogCreate.open();
		},

		_createMaterial: function() {
			var oEntry = {
				MaterialID: '',
				MaterialText: this.oDialogCreate.getContent()[1].getValue(),
				GroupID: this.oDialogCreate.getContent()[3].getValue(),
				SubGroupID: this.oDialogCreate.getContent()[5].setValue(),
				Version: "A",
				Language: 'RU'
			};
			this.getModel().create("/zjblessons_base_Materials", oEntry, {
				success: function(e) {
					MessageToast.show("Success");
				},
				error: function(e) {
					MessageToast.show("ERROR!");
				}
			});
			this.oDialogCreate.getContent()[1].setValue("");
			this.oDialogCreate.getContent()[3].setValue("");
			this.oDialogCreate.getContent()[5].setValue("");
		},

		onPressEdit: function(oEvent){
    		if(!this.oDialogEdit){
        	this.oDialogEdit = new Dialog({
          title: "Edit",
          type: "Message",
          contentWidth: "25rem",
          content: [
            new sap.m.Label({
              text: "MaterialText",
              labelFor: "MaterialTextEdit"
            }),
            new sap.m.Input("MaterialTextEdit", {
              width: "100%",
              value: "{MaterialText}"
            }),
            new sap.m.Label({
              text: "GroupID",
              labelFor: "GroupIDEdit"
            }),
            new sap.m.Input("GroupIDEdit", {
              width: "100%",
              value: "{GroupID}"
            }),
            new sap.m.Label({
              text: "SubGroupID",
              labelFor: "SuGroupIDEdit"
            }),
            new sap.m.Input("SubGroupIDEdit", {
              width: "100%",
              value: "{SubGroupID}"
            })
          ],
          beginButton: new sap.m.Button({
            type: "Emphasized",
            text: "Edit",
            press: function() {
              this.oDialogEdit.close();
            }.bind(this)
          }),
          endButton: new sap.m.Button({
            text: "Cancel",
            press: function() {
              this.oDialogEdit.close();
              this.oDialogEdit.getContent()[1].setValue("");
              this.oDialogEdit.getContent()[3].setValue("");
              this.oDialogEdit.getContent()[5].setValue("");
            }.bind(this)
          })
      }).addStyleClass("sapUISizeCompact");
    
      this.getView().addDependent(this.oDialogEdit);
      }
      this.oDialogEdit.open();
      this.oDialogEdit.setBindingContext(oEvent.getSource().getBindingContext());
    },
    
    _updateMaterial: function(){
      var sPath = this.oDialogEdit.getBindingContext().getPath();
      this.getModel().update(sPath, {
        MaterialText: this.oDialogEdit.getContent()[1].getValue(),
        GroupID: this.oDialogEdit.getContent()[3].getValue(),
        SubGroupID: this.oDialogEdit.getContent()[5].getValue()
      }, {
        success: function(e){
          MessageToast.show("Success");
        },
        error: function(e){
          MessageToast.show("ERROR!");
        }
      
      });
},
		onPressDelete: function(oEvent) {
			var sPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			this.getModel().remove(sPath);
		},
		
		onPressRefresh: function(){
			this.getModel().refresh(true); 
		},
		
		onPressReset: function(){
			this.getModel().resetChanges(); 
		},
		
		onPressSubmit: function(){
			this.getModel().submitChanges(); 
		},
		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function() {
			history.go(-1);
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("MaterialText", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("MaterialID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function(aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

	});
});