import preferGeneratedAssetHelper from "./rules/prefer-generated-asset-helper";

const plugin = {
    meta: {
        name: "typesafe-assets",
    },
    configs: {},
    rules: {
        "prefer-generated-asset-helper": preferGeneratedAssetHelper,
    },
};

Object.assign(plugin.configs, {
    recommended: [
        {
            plugins: {
                "typesafe-assets": plugin,
            },
            rules: {
                "typesafe-assets/prefer-generated-asset-helper": "error",
            },
        },
    ],
});

export default plugin;
