module.exports = {
    "env": {
        "es6": true,
        "node":true,
        "mocha":true
    },
    "extends": ["eslint:recommended"],
    "parser": "babel-eslint",
    "rules": {
        "no-console":["error",{
            "allow":["warn","error","info"]
        }]
    },
    "parserOptions":{
        "ecmaVersion":6,
        "sourceType":"script"
    },
};