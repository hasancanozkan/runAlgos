// @flow
'use strict';

const Instance = require('One/lib/instance.js');
const Storage = require('One/lib/storage.js');
const ObjectRecipes = require('One/lib/object-recipes.js');

/*
* A sample recipe for Prashant
* */
ObjectRecipes.addRecipe({
    type: 'Recipe',
    name: 'Prashant-ONE-Object',
    rule: [
        {
            type: 'RecipeRule',
            itemprop: 'name'
        },
        {
            type: 'RecipeRule',
            itemprop: 'data',
            jsType: 'object'
        }
    ]
});

const run = async function () {
    await Instance.init({
        email: 'prashant123219@gmail.com',
        instanceName: 'Prashant',
        directory: 'D:/PRASHANT'
    });

    const MyObj = {
        type: 'Prashant-ONE-Object',
        name: 'Prashant Chaudhari',
        data: [1,2,3]
    };

    return Storage.createSingleObjectThroughPlan(
        {module: 'lib/identity'},
        MyObj
    );

};

//noinspection JSIgnoredPromiseFromCall
run()
    .catch(err =>
        console.error(err)
    );
