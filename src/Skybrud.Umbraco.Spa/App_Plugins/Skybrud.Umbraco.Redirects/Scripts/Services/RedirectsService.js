﻿angular.module("umbraco.services").factory("skybrudRedirectsService", function ($http, editorService, notificationsService) {

    // Get the cache buster value
    const cacheBuster = Umbraco.Sys.ServerVariables.skybrud.redirects.cacheBuster;

    // Get the base URL for the API controller
    const baseUrl = Umbraco.Sys.ServerVariables.skybrud.redirects.baseUrl;

    var service = {

        parseUmbracoLink: function (e) {

            var key = "00000000-0000-0000-0000-000000000000";
            var type = "url";

            if (e.udi) {
                key = e.udi.split("/")[3];
                type = e.udi.split("/")[2];
            }

            return {
                id: e.id || 0,
                key: key,
                url: e.url,
                name: e.name,
                type: type === "document" ? "content" : type
            };

        },

        addLink: function (callback) {
            editorService.linkPicker({
                submit: function (e) {
                    if (!e.id && !e.url && !confirm("The selected link appears to be empty. Do you want to continue anyways?")) return;
                    if (callback) callback(e);
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });
        },

        editLink: function (link, callback, closeAllDialogs) {
            closeAllDialogs = closeAllDialogs !== false;
            if (closeAllDialogs) editorService.closeAll();
            if (link.type === "media") {
                editorService.linkPicker({
                    currentTarget: {
                        name: link.name,
                        url: link.url,
                        target: link.target
                    },
                    submit: function (e) {
                        if (!e.id && !e.url && !confirm("The selected link appears to be empty. Do you want to continue anyways?")) return;
                        if (service.parseUmbracoLink(e).id === 0) {
                            e.id = link.id;
                            e.isMedia = true;
                        }
                        if (callback) callback(service.parseUmbracoLink(e));
                        if (closeAllDialogs) editorService.closeAll();
                    }
                });
            } else {
                editorService.linkPicker({
                    currentTarget: {
                        id: link.id,
                        name: link.name,
                        url: link.url,
                        target: link.target
                    },
                    submit: function (e) {
                        if (!e.id && !e.url && !confirm("The selected link appears to be empty. Do you want to continue anyways?")) return;
                        if (callback) callback(service.parseUmbracoLink(e));
                        if (closeAllDialogs) editorService.closeAll();
                    }
                });
            }
        },

        addRedirect: function (options) {

            if (!options) options = {};
            if (typeof options === "function") options = { callback: options };

            const o = {
                size: "small",
                view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Dialogs/Redirect.html?v=${cacheBuster}`,
                options: options,
                submit: function(value) {
                    if (options.callback) options.callback(value);
                    editorService.close();
                },
                close: function() {
                    editorService.close();
                }
            };

            if (options.destination) o.destination = options.destination;

            editorService.open(o);

        },

        editRedirect: function (redirect, options) {

            if (!options) options = {};
            if (typeof options === "function") options = { callback: options };

            editorService.open({
	            size: "small",
                view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Dialogs/Redirect.html?v=${cacheBuster}`,
                redirect: redirect,
                options: options,
                submit: function (value) {
                    if (options.callback) options.callback(value);
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });

        },

        deleteRedirect: function (redirect, success, failed) {
            $http({
                method: "GET",
                url: `${baseUrl}DeleteRedirect`,
                params: {
                    redirectId: redirect.key
                }
            }).then(function () {
                notificationsService.success("Redirect deleted", "Your redirect was successfully deleted.");
                if (success) success(redirect);
            }, function (res) {
                notificationsService.error("Deleting redirect failed", res && res.data && res.data.meta ? res.data.meta.error : "The server was unable to delete your redirect.");
                if (failed) failed(redirect);
            });
        },

        isValidUrl: function (url, isRegex) {

            // Make sure we have a string and trim all leading and trailing whitespace
            url = $.trim(url + "");

            // For now a valid URL should start with a forward slash
            return isRegex || url.indexOf("/") === 0;

        },

        propertiesToObject: function (array) {

            var result = {};

            array.forEach(function (p) {
                result[p.alias] = p.value === undefined ? null : p.value;
            });

            return result;

        }

    };

    service.getRootNodes = function () {
        return $http.get(`${baseUrl}GetRootNodes`);
    };

    return service;

});