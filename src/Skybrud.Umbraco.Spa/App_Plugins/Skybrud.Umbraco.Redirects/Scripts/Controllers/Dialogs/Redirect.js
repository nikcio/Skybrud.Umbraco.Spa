﻿angular.module("umbraco").controller("SkybrudUmbracoRedirects.RedirectDialog.Controller", function ($scope, $http, editorService, notificationsService, skybrudRedirectsService, localizationService, formHelper) {

    // Get the cache buster value
    const cacheBuster = Umbraco.Sys.ServerVariables.skybrud.redirects.cacheBuster;

    // Get the base URL for the API controller
    const baseUrl = Umbraco.Sys.ServerVariables.skybrud.redirects.baseUrl;

    $scope.options = $scope.model.options || {};

    $scope.model.title = "Add new redirect";
    localizationService.localize("redirects_addNewRedirect").then(function (value) { $scope.model.title = value; });

    var destionation = null;

    $scope.model.hiddenProperties = [];

    if ($scope.model.redirect) {

        console.log($scope.model.redirect);

        $scope.model.title = "Edit redirect";
        localizationService.localize("redirects_editRedirect").then(function (value) { $scope.model.title = value; });

        $scope.model.submitButtonLabel = "Save";

        destionation = $scope.model.redirect.destination;

        $scope.model.hiddenProperties.push({
            alias: "id",
            value: $scope.model.redirect.id
        });

        $scope.model.hiddenProperties.push({
            alias: "key",
            value: $scope.model.redirect.key
        });

    } else if ($scope.model.destination) {

        destionation = $scope.model.destination;

    }

    $scope.model.properties = [];

    $scope.model.properties.push({
        alias: "rootNodeId",
        label: "Site",
        description: "Specify the site that the original URL to match from belongs to.",
        view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Editors/Site.html?v=${cacheBuster}`,
        value: $scope.model.redirect && $scope.model.redirect.rootId ? $scope.model.redirect.rootId : 0,
        config: {
            rootNodes: $scope.options.rootNodes
        },
        validation: {
            mandatory: false
        }
    });

    $scope.model.properties.push({
        alias: "originalUrl",
        label: "Original URL",
        description: "Specify the original URL to match from which the user should be redirected to the destination.",
        view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Editors/OriginalUrl.html?v=${cacheBuster}`,
        value: $scope.model.redirect ? $scope.model.redirect.url + ($scope.model.redirect.queryString ? "?" + $scope.model.redirect.queryString : "") : "",
        validation: {
            mandatory: true
        }
    });

    $scope.model.properties.push({
        alias: "destination",
        label: "Destination",
        description: "Select the page or URL the user should be redirected to.",
        view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Editors/Destination.html?v=${cacheBuster}`,
        value: destionation,
        validation: {
            mandatory: true
        }
    });

    $scope.model.advancedProperties = [
        {
            alias: "permanent",
            label: "Redirect type",
            labelKey: "redirects_propertyRedirectTypeName",
            description: "Select the type of the redirect. Notice that browsers will remember permanent redirects.",
            descriptionKey: "redirects_propertyRedirectTypeDescription",
            view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Editors/RadioGroup.html?v=${cacheBuster}`,
            value: $scope.model.redirect ? $scope.model.redirect.permanent : true,
            config: {
                options: [
                    {
                        label: "Permanent",
                        labelKey: "redirects_labelPermanent",
                        value: true
                    },
                    {
                        label: "Temporary",
                        labelKey: "redirects_labelTemporary",
                        value: false
                    }
                ]
            }
        },
        {
            alias: "forward",
            label: "Forward query string",
            labelKey: "redirects_forwardQueryString",
            description: "When enabled, the query string of the original request is forwarded to the redirect location (pass through).",
            descriptionKey: "redirects_forwardQueryStringDescription",
            view: `/App_Plugins/Skybrud.Umbraco.Redirects/Views/Editors/RadioGroup.html?v=${cacheBuster}`,
            value: $scope.model.redirect ? $scope.model.redirect.forward : false,
            config: {
                options: [
                    {
                        label: "Enabled",
                        labelKey: "redirects_labelEnabled",
                        value: true
                    },
                    {
                        label: "Disabled",
                        labelKey: "redirects_labelDisabled",
                        value: false
                    }
                ]
            }
        }
    ];

    var allProperties = $scope.model.properties.concat($scope.model.advancedProperties);
    allProperties = allProperties.concat($scope.model.hiddenProperties);

    allProperties.forEach(function (p) {
        if (p.labelKey) localizationService.localize(p.labelKey).then(function (value) { p.label = value; });
        if (p.descriptionKey) localizationService.localize(p.descriptionKey).then(function (value) { p.description = value; });
        if (p.config && p.config.options) {
            p.config.options.forEach(function (o) {
                if (o.labelKey) localizationService.localize(o.labelKey).then(function (value) { o.label = value; });
            });
        }
    });

    function initLabels() {

        //localizationService.localize("redirects_allSites").then(function (value) {
        //    $scope.rootNodes[0].name = value;
        //});

        $scope.labels = {
            saveSuccessfulTitle: "Redirect added",
            saveSuccessfulMessage: "Your redirect has successfully been added.",
            errorAddFailedTitle: "Saving failed",
            errorAddFailedMessage: "The redirect could not be saved due to an error on the server."
        };

        angular.forEach($scope.labels, function (value, key) {
            localizationService.localize(`redirects_${key}`).then(function (value) {
                $scope.labels[key] = value;
            });
        });

    }

    initLabels();

    $scope.save = function () {

        // Map the properties back to an object we can send to the API
        var redirect = skybrudRedirectsService.propertiesToObject(allProperties);

        // Attempt to submit the form (Angular validation will kick in)
        if (!formHelper.submitForm({ scope: $scope })) return;

        // Reset the Angular form
        formHelper.resetForm({ scope: $scope });

        // Make sure we set a loading state
        $scope.loading = true;

        // Make sure we set the "rootNodeKey" property as well
        if (redirect.rootNodeId > 0) {
            const rootNode = $scope.options.rootNodes.find(x => x.id === redirect.rootNodeId);
            redirect.rootNodeKey = rootNode ? rootNode.key : "00000000-0000-0000-0000-000000000000";
        } else {
            redirect.rootNodeKey = "00000000-0000-0000-0000-000000000000";
        }

        if (redirect.key) {
            $http({
                method: "POST",
                url: `${baseUrl}EditRedirect`,
                params: {
                    redirectId: redirect.key
                },
                data: redirect
            }).then(function (r) {
                $scope.loading = false;
                notificationsService.success($scope.labels.saveSuccessfulTitle, $scope.labels.saveSuccessfulMessage);
                $scope.model.submit(r);
            }, function (res) {
                $scope.loading = false;
                notificationsService.error($scope.labels.errorAddFailedTitle, res && res.data && res.data.meta ? res.data.meta.error : $scope.labels.errorAddFailedMessage);
            });
        } else {
            $http({
                method: "POST",
                url: `${baseUrl}AddRedirect`,
                data: redirect
            }).then(function (r) {
                $scope.loading = false;
                notificationsService.success($scope.labels.saveSuccessfulTitle, $scope.labels.saveSuccessfulMessage);
                $scope.model.submit(r);
            }, function (res) {
                $scope.loading = false;
                notificationsService.error($scope.labels.errorAddFailedTitle, res && res.data && res.data.meta ? res.data.meta.error : $scope.labels.errorAddFailedMessage);
            });
        }

    };

    $scope.close = function () {
        if ($scope.model.close) {
            $scope.model.close();
        } else {
            editorService.close();
        }
    };

});